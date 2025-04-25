import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Event as EventIcon,
  Description as DocumentIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  DateRange as DateRangeIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [appointmentFormData, setAppointmentFormData] = useState({
    appointmentType: '',
    provider: '',
    date: null,
    time: null,
    notes: ''
  });
  const [appointmentFormErrors, setAppointmentFormErrors] = useState({});

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentFormData, setDocumentFormData] = useState({
    documentType: '',
    documentDate: null,
    description: '',
    tags: ''
  });
  const [documentFormErrors, setDocumentFormErrors] = useState({});

  // Assessments state
  const [assessments, setAssessments] = useState([]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      // Check if user is logged in - This check is now done after hooks
      // if (!user) { ... } // Moved below

      // ALWAYS load ALL assessments immediately on mount to ensure consistent data
      const loadAllAssessments = async () => {
        console.log('IMMEDIATE LOAD: Getting assessments for the logged-in user');
        try {
          // Corrected endpoint: Fetch assessments for the specific user
          const response = await api.get('/assessment/user');
          console.log('IMMEDIATE LOAD: Got', response.data?.length || 0, 'assessments for user');

          if (Array.isArray(response.data)) { // Check if data is array before sorting
             const sortedAssessments = response.data.sort((a, b) =>
               new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
             );
             setAssessments(sortedAssessments);
             // Also cache in localStorage for faster access
             localStorage.setItem('cachedAssessments', JSON.stringify(sortedAssessments));
             localStorage.setItem('assessmentCacheTimestamp', Date.now().toString());
          } else {
             console.warn('IMMEDIATE LOAD: Received non-array response for assessments:', response.data);
             setAssessments([]); // Set to empty array if response is not as expected
          }
          setLoading(false); // End loading state once we have data or confirmed no data

        } catch (err) {
          console.error('IMMEDIATE LOAD: Error loading assessments:', err);
          setError('Failed to load assessments. Please try refreshing.'); // Set user-facing error

          // Try to load from cache as backup
          try {
            const cachedData = localStorage.getItem('cachedAssessments');
            if (cachedData) {
              const parsedData = JSON.parse(cachedData);
              console.log('IMMEDIATE LOAD: Using cached data with', parsedData.length, 'assessments');
              setAssessments(parsedData);
            } else {
              setAssessments([]); // Ensure state is empty if cache is empty/invalid
            }
          } catch (cacheErr) {
            console.error('IMMEDIATE LOAD: Error using cached data:', cacheErr);
            setAssessments([]); // Ensure state is empty on cache error
          }
          setLoading(false); // Ensure loading stops even on error
        }
      };

      // Execute immediate load only if user exists
      if (user) {
        loadAllAssessments();

        try {
          console.log('Fetching other user data...');
          console.log('Auth token:', localStorage.getItem('token'));
          console.log('User object:', user);

          // Fetch appointments
          try {
            console.log('Fetching appointments...');
            const appointmentsRes = await api.get('/appointments');
            console.log('Appointments response:', appointmentsRes.data);
            setAppointments(appointmentsRes.data || []); // Default to empty array
          } catch (err) {
            console.error('Error fetching appointments:', err.response?.status, err.response?.data || err.message);
            setAppointments([]);
          }

          // Fetch documents
          try {
            console.log('Fetching documents...');
            const documentsRes = await api.get('/documents');
            console.log('Documents response:', documentsRes.data);
            setDocuments(documentsRes.data || []); // Default to empty array
          } catch (err) {
            console.error('Error fetching documents:', err.response?.status, err.response?.data || err.message);
            setDocuments([]);
          }

        } catch (err) {
          console.error('Error fetching user data (appointments/documents):', err);
          setError(err.message || 'Failed to load user data. Please try again.');
        } finally {
          // Loading state is handled within loadAllAssessments now
          // setLoading(false);
        }
      } else {
         // If no user, stop loading and set error
         setLoading(false);
         setError('Please log in to view your dashboard');
      }
    };

    fetchUserData();

  }, [user]); // Rerun when user object changes (login/logout)

  // Auto-refresh assessments - Moved BEFORE the early return
  useEffect(() => {
    // Only run if user is logged in and assessment tab is active
    if (!user || tabValue !== 2) return;

    console.log('Setting up assessment auto-refresh interval');
    const interval = setInterval(() => {
      console.log('Auto-refreshing user assessments...');
      api.get('/assessment/user') // Corrected endpoint
        .then(response => {
          if (Array.isArray(response.data)) {
            const sortedAssessments = response.data.sort((a, b) =>
              new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
            );
            // Only update state if data has actually changed to prevent unnecessary re-renders
            setAssessments(prevAssessments => {
              if (JSON.stringify(prevAssessments) !== JSON.stringify(sortedAssessments)) {
                console.log('Auto-refresh: Updating assessments state.');
                localStorage.setItem('cachedAssessments', JSON.stringify(sortedAssessments));
                localStorage.setItem('assessmentCacheTimestamp', Date.now().toString());
                return sortedAssessments;
              }
              return prevAssessments;
            });
          } else {
             console.warn('Auto-refresh: Received non-array response for assessments:', response.data);
          }
        })
        .catch(err => console.error('Auto-refresh error:', err));
    }, 30000); // Refresh every 30 seconds

    return () => {
      console.log('Clearing assessment auto-refresh interval');
      clearInterval(interval);
    };
  }, [user, tabValue]); // Rerun if user logs in/out or tab changes

  // Clear incorrect token or bad auth data if user object incomplete - Moved BEFORE the early return
  useEffect(() => {
    if (user && (!user.id || !user.email)) {
      console.error('User object is incomplete:', user);
      // Consider logging out the user automatically if their data is corrupt
      // logout(); // Optional: force logout
      localStorage.removeItem('userId');
    }
  }, [user]); // Rerun if user object changes

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Appointment handlers
  const handleAppointmentDialogOpen = () => {
    setAppointmentFormData({
      appointmentType: '',
      provider: '',
      date: null,
      time: null,
      notes: ''
    });
    setAppointmentFormErrors({});
    setAppointmentDialogOpen(true);
  };

  const handleAppointmentDialogClose = () => {
    setAppointmentDialogOpen(false);
  };

  const handleAppointmentFormChange = (e) => {
    const { name, value } = e.target;
    setAppointmentFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (appointmentFormErrors[name]) {
      setAppointmentFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (date) => {
    setAppointmentFormData(prev => ({
      ...prev,
      date: date instanceof Date && !isNaN(date) ? date : null
    }));

    // Clear error when user selects date
    if (appointmentFormErrors.date) {
      setAppointmentFormErrors(prev => ({
        ...prev,
        date: ''
      }));
    }
  };

  const handleTimeChange = (time) => {
    setAppointmentFormData(prev => ({
      ...prev,
      time: time instanceof Date && !isNaN(time) ? time : null
    }));

    // Clear error when user selects time
    if (appointmentFormErrors.time) {
      setAppointmentFormErrors(prev => ({
        ...prev,
        time: ''
      }));
    }
  };

  const validateAppointmentForm = () => {
    const newErrors = {};

    if (!appointmentFormData.appointmentType) {
      newErrors.appointmentType = 'Appointment type is required';
    }

    if (!appointmentFormData.provider) {
      newErrors.provider = 'Provider is required';
    }

    if (!appointmentFormData.date) {
      newErrors.date = 'Date is required';
    }

    if (!appointmentFormData.time) {
      newErrors.time = 'Time is required';
    }

    setAppointmentFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAppointmentSubmit = async () => {
    if (!validateAppointmentForm()) return;

    try {
      setLoading(true);

      const formattedTime = appointmentFormData.time
        ? format(appointmentFormData.time, 'HH:mm')
        : '';

      const response = await api.post('/appointments', {
        ...appointmentFormData,
        time: formattedTime
      });

      setAppointments(prev => [...prev, response.data].sort((a, b) => new Date(b.date) - new Date(a.date))); // Add and sort
      setAppointmentDialogOpen(false);

      // Show success message or notification
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('Failed to create appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Document handlers
  const handleDocumentDialogOpen = () => {
    setDocumentFormData({
      documentType: '',
      documentDate: null,
      description: '',
      tags: ''
    });
    setSelectedFile(null);
    setDocumentFormErrors({});
    setDocumentDialogOpen(true);
  };

  const handleDocumentDialogClose = () => {
    setDocumentDialogOpen(false);
  };

  const handleDocumentFormChange = (e) => {
    const { name, value } = e.target;
    setDocumentFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (documentFormErrors[name]) {
      setDocumentFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDocumentDateChange = (date) => {
    setDocumentFormData(prev => ({
      ...prev,
      documentDate: date instanceof Date && !isNaN(date) ? date : null
    }));

    // Clear error when user selects date
    if (documentFormErrors.documentDate) {
      setDocumentFormErrors(prev => ({
        ...prev,
        documentDate: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);

      // Clear error when user selects file
      if (documentFormErrors.file) {
        setDocumentFormErrors(prev => ({
          ...prev,
          file: ''
        }));
      }
    }
  };

  const validateDocumentForm = () => {
    const newErrors = {};

    if (!selectedFile) {
      newErrors.file = 'File is required';
    }

    if (!documentFormData.documentType) {
      newErrors.documentType = 'Document type is required';
    }

    if (!documentFormData.documentDate) {
      newErrors.documentDate = 'Document date is required';
    }

    setDocumentFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDocumentSubmit = async () => {
    if (!validateDocumentForm()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentFormData.documentType);
      formData.append('documentDate', documentFormData.documentDate.toISOString());
      formData.append('description', documentFormData.description);
      formData.append('tags', documentFormData.tags);

      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setDocuments(prev => [...prev, response.data].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))); // Add and sort
      setDocumentDialogOpen(false);

      // Show success message or notification
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (documentId) => {
    try {
      // Use the API endpoint which should handle authentication
      window.open(`/api/documents/download/${documentId}`, '_blank');
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Failed to download document. Please try again.');
    }
  };

  const handleStartNewAssessment = () => {
    navigate('/assessment');
  };

  const handleViewAssessment = (assessmentId) => {
    // First store the assessment ID in localStorage to ensure it's accessible
    localStorage.setItem('assessmentId', assessmentId);
    // Then navigate to the dashboard with the ID in state
    navigate('/dashboard', { state: { assessmentId } });
  };

  // Debugging function to check assessment structure
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
       return format(new Date(dateString), 'PP'); // Format like 'Sep 21, 2023'
    } catch (e) {
       console.error("Error formatting date:", dateString, e);
       return 'Invalid Date';
    }
  };

  // Helper to get average pain level
  const getAveragePainLevel = (painLevels) => {
    if (!painLevels || typeof painLevels !== 'object' || Object.keys(painLevels).length === 0) return 'N/A';

    const levels = Object.values(painLevels).filter(level => typeof level === 'number');
    if (levels.length === 0) return 'N/A';

    const sum = levels.reduce((total, level) => total + level, 0);
    return (sum / levels.length).toFixed(1);
  };

  // Show login prompt if not authenticated - Placed after hooks
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Login Required
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Please log in to view your dashboard and assessment history.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #1a365d 30%, #2b6cb0 90%)'
              }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/register')}
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              Create Account
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Loading state - Show only if truly loading initial data
  if (loading && !assessments.length && !appointments.length && !documents.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    // Container adjusted to work within Layout
    <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 4 }}>
      {/* Main Paper adjusted for dark theme */}
      <Paper elevation={6} sx={{ p: 3, borderRadius: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(20, 25, 35, 0.8)', backdropFilter: 'blur(8px)', color: 'white' }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}> {/* Bolder title */}
            User Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* Buttons styled for dark theme */}
            <Button
              variant="outlined"
              // color="primary" // Use sx for specific colors
              sx={{ color: '#bb86fc', borderColor: 'rgba(187, 134, 252, 0.5)', '&:hover': { borderColor: '#bb86fc', backgroundColor: 'rgba(187, 134, 252, 0.1)' } }}
              onClick={() => {
                setLoading(true);
                api.get('/assessment/user') // Corrected endpoint
                  .then(response => {
                    if (Array.isArray(response.data)) {
                      console.log('Manual refresh found', response.data?.length || 0, 'assessments for user');
                      const sortedAssessments = response.data.sort((a, b) =>
                        new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
                      );
                      setAssessments(sortedAssessments);
                      localStorage.setItem('cachedAssessments', JSON.stringify(sortedAssessments));
                      localStorage.setItem('assessmentCacheTimestamp', Date.now().toString());
                    } else {
                      console.log('Manual refresh found no assessments or invalid data');
                      setAssessments([]); // Clear assessments if response is invalid
                    }
                  })
                  .catch(err => {
                    console.error('Error in manual assessment refresh:', err);
                    setError('Failed to refresh assessments.');
                  })
                  .finally(() => setLoading(false)); // Stop loading indicator
              }}
            >
              Refresh Data
            </Button>
            {user?.isAdmin && (
              <Button
                variant="contained"
                // color="primary" // Use sx
                sx={{ backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
                onClick={() => navigate('/admin-dashboard')}
              >
                Go to Admin Dashboard
              </Button>
            )}
            <Button
              variant="outlined"
              // color="error" // Use sx
              sx={{ color: '#f48fb1', borderColor: 'rgba(244, 143, 177, 0.5)', '&:hover': { borderColor: '#f48fb1', backgroundColor: 'rgba(244, 143, 177, 0.1)' } }}
              onClick={logout}
            >
              Logout
            </Button>
          </Box>
        </Box>


        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs styled for dark theme */}
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.23)' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="dashboard tabs"
            variant="fullWidth"
            textColor="inherit" // Use inherit to allow sx styling
            indicatorColor="primary" // Or secondary, depending on theme preference
            sx={{
              '& .MuiTab-root': { // Style individual tabs
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: 'white', // Color for selected tab
                },
              },
              '& .MuiTabs-indicator': { // Style the indicator line
                 backgroundColor: '#bb86fc' // Example: Purple indicator
              }
            }}
          >
            <Tab
              label="Appointments"
              icon={<EventIcon />}
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600 }} // Style tab text
            />
            <Tab
              label="Documents"
              icon={<DocumentIcon />}
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600 }} // Style tab text
            />
            <Tab
              label="Assessments"
              icon={<AssessmentIcon />}
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600 }} // Style tab text
            />
          </Tabs>
        </Box>

        {/* Appointments Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Your Appointments
            </Typography>
            {/* Button styled like HomePage */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAppointmentDialogOpen}
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#1a1a2e', '&:hover': { backgroundColor: 'white' } }}
            >
              Book Appointment
            </Button>
          </Box>

          {loading && appointments.length === 0 ? <CircularProgress sx={{display: 'block', margin: 'auto', color: 'white'}} /> : appointments.length === 0 ? (
            <Alert severity="info" variant="outlined" sx={{ borderColor: 'info.light', color: 'info.light', '& .MuiAlert-icon': { color: 'info.light' } }}> {/* Outlined Alert */}
              You don't have any appointments yet. Book your first appointment now.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {appointments.map((appointment) => (
                <Grid item xs={12} md={6} key={appointment._id}>
                  {/* Card styled for dark theme */}
                  <Card elevation={4} sx={{ backgroundColor: 'rgba(30, 40, 55, 0.9)', color: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <HospitalIcon sx={{ mr: 1, color: '#bb86fc' }} /> {/* Icon color */}
                        <Typography variant="h6" component="div">
                          {appointment.appointmentType === 'surgeon' ? 'Surgeon Appointment' :
                            appointment.appointmentType === 'allied_health' ? 'Allied Health Appointment' :
                              'Imaging Appointment'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon fontSize="small" sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Provider: {appointment.provider}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Date: {formatDate(appointment.date)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TimeIcon fontSize="small" sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Time: {appointment.time}
                        </Typography>
                      </Box>

                      {appointment.notes && (
                        <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
                          Notes: {appointment.notes}
                        </Typography>
                      )}

                      {/* Chip styling adjusted */}
                      <Chip
                        label={appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Unknown'}
                        size="small"
                        sx={{
                          mt: 2,
                          backgroundColor:
                            appointment.status === 'scheduled' ? 'primary.dark' :
                            appointment.status === 'completed' ? 'success.dark' :
                            appointment.status === 'cancelled' ? 'error.dark' : 'grey.700',
                          color: 'white'
                        }}
                      />
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end' }}> {/* Align actions */}
                      {/* Buttons styled */}
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => {/* Handle edit */ }}
                        sx={{ color: '#bb86fc' }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        // color="error" // Use sx
                        startIcon={<DeleteIcon />}
                        onClick={() => {/* Handle delete */ }}
                        sx={{ color: '#f48fb1' }}
                      >
                        Cancel
                      </Button>
                      {appointment.status === 'completed' && (
                        <Button
                          size="small"
                          // color="secondary" // Use sx
                          sx={{ color: '#03dac6' }}
                          onClick={() => navigate('/assessment')}
                        >
                          New Assessment
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Documents Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Your Medical Documents
            </Typography>
            {/* Button styled like HomePage */}
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={handleDocumentDialogOpen}
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#1a1a2e', '&:hover': { backgroundColor: 'white' } }}
            >
              Upload Document
            </Button>
          </Box>

          {loading && documents.length === 0 ? <CircularProgress sx={{display: 'block', margin: 'auto', color: 'white'}} /> : documents.length === 0 ? (
            <Alert severity="info" variant="outlined" sx={{ borderColor: 'info.light', color: 'info.light', '& .MuiAlert-icon': { color: 'info.light' } }}> {/* Outlined Alert */}
              You don't have any documents yet. Upload your first document now.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {documents.map((document) => (
                <Grid item xs={12} md={6} key={document._id}>
                  {/* Card styled for dark theme */}
                  <Card elevation={4} sx={{ backgroundColor: 'rgba(30, 40, 55, 0.9)', color: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DocumentIcon sx={{ mr: 1, color: '#bb86fc' }} /> {/* Icon color */}
                        <Typography variant="h6" component="div">
                          {document.documentType ? document.documentType.split('_').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ') : 'Unknown Type'}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} gutterBottom>
                        {document.originalName || 'No filename'}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Document Date: {formatDate(document.documentDate)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Uploaded: {formatDate(document.uploadDate)}
                        </Typography>
                      </Box>

                      {document.description && (
                        <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
                          {document.description}
                        </Typography>
                      )}

                      {document.tags && document.tags.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {document.tags.map((tag, index) => (
                            <Chip key={index} label={tag} size="small" sx={{ backgroundColor: 'grey.700', color: 'white' }} /> // Chip styling
                          ))}
                        </Box>
                      )}
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end' }}> {/* Align actions */}
                      {/* Buttons styled */}
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadDocument(document._id)}
                        sx={{ color: '#bb86fc' }}
                      >
                        Download
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => {/* Handle edit */ }}
                        sx={{ color: '#bb86fc' }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        // color="error" // Use sx
                        startIcon={<DeleteIcon />}
                        onClick={() => {/* Handle delete */ }}
                        sx={{ color: '#f48fb1' }}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Assessments Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Your Pain Assessments
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Button styled like HomePage */}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleStartNewAssessment}
                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#1a1a2e', '&:hover': { backgroundColor: 'white' } }}
              >
                New Assessment
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
             {loading && assessments.length === 0 ? <CircularProgress sx={{display: 'block', margin: 'auto', color: 'white'}} /> : assessments.length === 0 ? (
              <>
                <Alert severity="info" variant="outlined" sx={{ mb: 3, borderColor: 'info.light', color: 'info.light', '& .MuiAlert-icon': { color: 'info.light' } }}> {/* Outlined Alert */}
                  You don't have any assessments yet. Start your first assessment now.
                </Alert>
                {/* Debug button styled */}
                <Button
                  variant="outlined"
                  // color="primary" // Use sx
                  sx={{ mb: 2, color: '#bb86fc', borderColor: 'rgba(187, 134, 252, 0.5)', '&:hover': { borderColor: '#bb86fc', backgroundColor: 'rgba(187, 134, 252, 0.1)' } }}
                  onClick={async () => {
                    try {
                      // Force a direct check of user's assessments
                      const userAssessmentsResponse = await api.get('/assessment/user'); // Corrected endpoint
                      console.log('Direct check of user assessments:', userAssessmentsResponse.data);
                      if (Array.isArray(userAssessmentsResponse.data) && userAssessmentsResponse.data.length > 0) {
                        setAssessments(userAssessmentsResponse.data);
                      } else {
                        console.log('No assessments found for user in direct check');
                      }
                    } catch (e) {
                      console.error('Error checking assessments directly:', e);
                    }
                  }}
                >
                  Debug: Check for Assessments
                </Button>
                {/* Paper styled for dark theme */}
                <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(30, 40, 55, 0.9)', mt: 2, color: 'white' }}>
                  <Typography variant="h6" gutterBottom>
                    Getting Started with Assessments
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Complete a pain assessment to get personalized treatment recommendations.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    {/* Button styled like HomePage */}
                    <Button
                      variant="contained"
                      // color="primary" // Use sx
                      onClick={handleStartNewAssessment}
                      startIcon={<AssessmentIcon />}
                      size="large"
                      sx={{ py: 1.5, px: 3, backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#1a1a2e', '&:hover': { backgroundColor: 'white' } }}
                    >
                      Start Your First Assessment
                    </Button>

                    <Typography variant="caption" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                      If no assessments appear above, click the "Refresh Data" button in the top right.
                    </Typography>
                  </Box>
                </Paper>
              </>
            ) : (
              <>
                <Alert severity="success" variant="outlined" sx={{ mb: 3, borderColor: 'success.light', color: 'success.light', '& .MuiAlert-icon': { color: 'success.light' } }}> {/* Outlined Alert */}
                  <Typography variant="body1" fontWeight="bold">
                    {assessments.length} assessment{assessments.length !== 1 ? 's' : ''} found
                  </Typography>
                  <Typography variant="body2">
                    Click on any assessment to view detailed results.
                  </Typography>
                </Alert>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Showing your pain assessments from the database.
                  </Typography>
                </Box>
              </>
            )}
          </Box>

          {assessments.length > 0 && (
            <List sx={{ color: 'white' }}> {/* Ensure list text is white */}
              {assessments.map((assessment) => (
                <Paper key={assessment._id} elevation={2} sx={{ mb: 2, backgroundColor: 'rgba(30, 40, 55, 0.9)' }}> {/* Darker paper for list items */}
                  <ListItem
                    secondaryAction={
                      <Box sx={{ display: 'flex' }}>
                        <Tooltip title="View Assessment Results">
                          {/* Icon button color */}
                          <IconButton edge="end" onClick={() => handleViewAssessment(assessment._id)} sx={{ color: '#bb86fc' }}>
                            <AssessmentIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }}> {/* Icon color */}
                      <EventIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: 'white' }}> {/* Ensure primary text is white */}
                            Assessment from {formatDate(assessment.timestamp || assessment.createdAt)}
                          </Typography>
                          <Typography variant="caption" sx={{ ml: 2, color: 'rgba(255, 255, 255, 0.7)' }}> {/* Secondary text color */}
                            ID: {assessment._id ? (typeof assessment._id === 'string' ? assessment._id.substring(0, 8) : String(assessment._id).substring(0, 8)) : 'Unknown'}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}> {/* Secondary text color */}
                            {assessment.painLevels && typeof assessment.painLevels === 'object' && Object.keys(assessment.painLevels).length > 0 ? (
                              <>
                                Avg Pain: {getAveragePainLevel(assessment.painLevels)} |
                                Pain Points: {Object.keys(assessment.painLevels || {}).length}
                              </>
                            ) : (
                              <i>No pain data recorded</i>
                            )}
                          </Typography>

                          {/* Chip styling adjusted */}
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {assessment.imagingStudies && assessment.imagingStudies.length > 0 && (
                              <Chip
                                label="Has Medical Imaging"
                                size="small"
                                sx={{ mr: 0.5, backgroundColor: 'primary.dark', color: 'white' }}
                              />
                            )}

                            {assessment.surgicalHistory?.hasPreviousSurgery && (
                              <Chip
                                label="Previous Surgery"
                                size="small"
                                sx={{ mr: 0.5, backgroundColor: 'secondary.dark', color: 'white' }}
                              />
                            )}

                            {assessment.medicalConditions && Object.values(assessment.medicalConditions).some(v => v === true) && (
                              <Chip
                                label="Medical Conditions"
                                size="small"
                                sx={{ mr: 0.5, backgroundColor: 'info.dark', color: 'white' }}
                              />
                            )}
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          )}
        </TabPanel>
      </Paper>

      {/* Dialogs styled for dark theme */}
      <Dialog
        open={appointmentDialogOpen}
        onClose={handleAppointmentDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { backgroundColor: '#1f2a3e', color: 'white' } }} // Dark background for dialog
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Book New Appointment</DialogTitle>
        <DialogContent>
          {/* Form elements styled */}
          <FormControl fullWidth margin="normal" error={!!appointmentFormErrors.appointmentType}>
            <InputLabel id="appointment-type-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Appointment Type</InputLabel>
            <Select
              labelId="appointment-type-label"
              id="appointmentType"
              name="appointmentType"
              value={appointmentFormData.appointmentType}
              onChange={handleAppointmentFormChange}
              label="Appointment Type"
              variant="filled"
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', '& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.7)' } }}
              MenuProps={{ PaperProps: { sx: { backgroundColor: '#2c3a52', color: 'white' } } }} // Style dropdown menu
            >
              <MenuItem value="surgeon">Surgeon</MenuItem>
              <MenuItem value="allied_health">Allied Health</MenuItem>
              <MenuItem value="imaging">Imaging</MenuItem>
            </Select>
            {appointmentFormErrors.appointmentType && (
              <Typography variant="caption" color="error">
                {appointmentFormErrors.appointmentType}
              </Typography>
            )}
          </FormControl>

          <TextField
            margin="normal"
            fullWidth
            id="provider"
            name="provider"
            label="Provider Name"
            value={appointmentFormData.provider}
            onChange={handleAppointmentFormChange}
            error={!!appointmentFormErrors.provider}
            helperText={appointmentFormErrors.provider}
            variant="filled"
            sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, '.MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' } }}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <DatePicker
                label="Appointment Date"
                value={appointmentFormData.date}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!appointmentFormErrors.date}
                    helperText={appointmentFormErrors.date}
                    variant="filled"
                    sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, svg: { color: 'rgba(255, 255, 255, 0.7)' }, input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, '.MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' } }}
                  />
                )}
                // Add PaperProps for DatePicker popup styling if needed
              />

              <TimePicker
                label="Appointment Time"
                value={appointmentFormData.time}
                onChange={handleTimeChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!appointmentFormErrors.time}
                    helperText={appointmentFormErrors.time}
                    variant="filled"
                    sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, svg: { color: 'rgba(255, 255, 255, 0.7)' }, input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, '.MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' } }}
                  />
                )}
                // Add PaperProps for TimePicker popup styling if needed
              />
            </Box>
          </LocalizationProvider>

          <TextField
            margin="normal"
            fullWidth
            id="notes"
            name="notes"
            label="Notes (Optional)"
            multiline
            rows={4}
            value={appointmentFormData.notes}
            onChange={handleAppointmentFormChange}
            variant="filled"
            sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, textarea: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={handleAppointmentDialogClose} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Cancel</Button>
          <Button
            onClick={handleAppointmentSubmit}
            variant="contained"
            disabled={loading}
            sx={{ backgroundColor: '#bb86fc', '&:hover': { backgroundColor: '#a16ae8' } }} // Example purple button
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Book Appointment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Upload Dialog styled */}
      <Dialog
        open={documentDialogOpen}
        onClose={handleDocumentDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { backgroundColor: '#1f2a3e', color: 'white' } }} // Dark background
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Upload Medical Document</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 2 }}>
            {/* Button styled */}
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<UploadIcon />}
              sx={{ py: 1.5, color: '#bb86fc', borderColor: 'rgba(187, 134, 252, 0.5)', '&:hover': { borderColor: '#bb86fc', backgroundColor: 'rgba(187, 134, 252, 0.1)' } }}
            >
              Select File
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.9)' }}>
                Selected: {selectedFile.name}
              </Typography>
            )}
            {documentFormErrors.file && (
              <Typography variant="caption" color="error">
                {documentFormErrors.file}
              </Typography>
            )}
          </Box>

          {/* Form elements styled */}
          <FormControl fullWidth margin="normal" error={!!documentFormErrors.documentType}>
            <InputLabel id="document-type-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Document Type</InputLabel>
            <Select
              labelId="document-type-label"
              id="documentType"
              name="documentType"
              value={documentFormData.documentType}
              onChange={handleDocumentFormChange}
              label="Document Type"
              variant="filled"
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', '& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.7)' } }}
              MenuProps={{ PaperProps: { sx: { backgroundColor: '#2c3a52', color: 'white' } } }}
            >
              <MenuItem value="imaging">Imaging (X-Ray, MRI, CT)</MenuItem>
              <MenuItem value="lab_results">Lab Results</MenuItem>
              <MenuItem value="doctor_notes">Doctor Notes</MenuItem>
              <MenuItem value="prescription">Prescription</MenuItem>
              <MenuItem value="surgery_report">Surgery Report</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
            {documentFormErrors.documentType && (
              <Typography variant="caption" color="error">
                {documentFormErrors.documentType}
              </Typography>
            )}
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mt: 2 }}>
              <DatePicker
                label="Document Date"
                value={documentFormData.documentDate}
                onChange={handleDocumentDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!documentFormErrors.documentDate}
                    helperText={documentFormErrors.documentDate}
                    variant="filled"
                    sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, svg: { color: 'rgba(255, 255, 255, 0.7)' }, input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, '.MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' } }}
                  />
                )}
              />
            </Box>
          </LocalizationProvider>

          <TextField
            margin="normal"
            fullWidth
            id="description"
            name="description"
            label="Description (Optional)"
            multiline
            rows={3}
            value={documentFormData.description}
            onChange={handleDocumentFormChange}
            variant="filled"
            sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, textarea: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />

          <TextField
            margin="normal"
            fullWidth
            id="tags"
            name="tags"
            label="Tags (Optional, comma separated)"
            value={documentFormData.tags}
            onChange={handleDocumentFormChange}
            placeholder="e.g. knee, surgery, follow-up"
            variant="filled"
            sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={handleDocumentDialogClose} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Cancel</Button>
          <Button
            onClick={handleDocumentSubmit}
            variant="contained"
            disabled={loading}
            sx={{ backgroundColor: '#bb86fc', '&:hover': { backgroundColor: '#a16ae8' } }} // Example purple button
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Upload Document'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserDashboard;
