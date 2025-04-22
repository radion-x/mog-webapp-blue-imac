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
  // The test assessment function has been removed

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      // Check if user is logged in
      if (!user) {
        console.log('No user authenticated, showing login options');
        setError('Please log in to access your dashboard');
        setLoading(false);
        return;
      }

      // ALWAYS load ALL assessments immediately on mount to ensure consistent data
      const loadAllAssessments = async () => {
        console.log('IMMEDIATE LOAD: Getting all assessments');
        try {
          const response = await api.get('/assessment');
          console.log('IMMEDIATE LOAD: Got', response.data?.length || 0, 'assessments');

          if (Array.isArray(response.data) && response.data.length > 0) {
            // Sort by date (newest first)
            const sortedAssessments = response.data.sort((a, b) =>
              new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
            );

            // Update state with all assessments
            setAssessments(sortedAssessments);
            setLoading(false); // End loading state immediately once we have data

            // Also cache in localStorage for faster access
            localStorage.setItem('cachedAssessments', JSON.stringify(sortedAssessments));
            localStorage.setItem('assessmentCacheTimestamp', Date.now().toString());
          }
        } catch (err) {
          console.error('IMMEDIATE LOAD: Error loading assessments:', err);

          // Try to load from cache as backup
          try {
            const cachedData = localStorage.getItem('cachedAssessments');
            if (cachedData) {
              const parsedData = JSON.parse(cachedData);
              console.log('IMMEDIATE LOAD: Using cached data with', parsedData.length, 'assessments');
              setAssessments(parsedData);
              setLoading(false);
            }
          } catch (cacheErr) {
            console.error('IMMEDIATE LOAD: Error using cached data:', cacheErr);
          }
        }
      };

      // Execute immediate load
      loadAllAssessments();

      try {
        console.log('Fetching user data...');
        console.log('Auth token:', localStorage.getItem('token'));
        console.log('User object:', user);

        // Fetch appointments
        try {
          console.log('Fetching appointments...');
          const appointmentsRes = await api.get('/appointments');
          console.log('Appointments response:', appointmentsRes.data);
          setAppointments(appointmentsRes.data);
        } catch (err) {
          console.error('Error fetching appointments:', err.response?.status, err.response?.data || err.message);
          setAppointments([]);
        }

        // Fetch documents
        try {
          console.log('Fetching documents...');
          const documentsRes = await api.get('/documents');
          console.log('Documents response:', documentsRes.data);
          setDocuments(documentsRes.data);
        } catch (err) {
          console.error('Error fetching documents:', err.response?.status, err.response?.data || err.message);
          setDocuments([]);
        }

        // Fetch assessments directly from the database
        // This section has been replaced by the immediate load mechanism above
        // and the auto-refresh effect that continuously updates the data
        console.log('LEGACY fetch method bypassed - using direct load and auto-refresh instead');

        // We still need to do the rest of user data loading
        // But assessments are already being loaded separately for better reliability
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if user is authenticated
    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
      setError('Please log in to view your dashboard');
    }
  }, [user]);

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

      setAppointments(prev => [...prev, response.data]);
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

      setDocuments(prev => [...prev, response.data]);
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
    return new Date(dateString).toLocaleDateString();
  };

  // Helper to get average pain level
  const getAveragePainLevel = (painLevels) => {
    if (!painLevels || Object.keys(painLevels).length === 0) return 'No pain data';

    const levels = Object.values(painLevels);
    const sum = levels.reduce((total, level) => total + level, 0);
    return (sum / levels.length).toFixed(1);
  };

  // DEBUG: Function to load mock assessments for testing
  // The mock assessment function has been removed

  // Show login prompt if not authenticated
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

  // Clear any incorrect token or bad auth data if we get here but the user object is incomplete
  if (user && (!user.id || !user.email)) {
    console.error('User object is incomplete:', user);
    localStorage.removeItem('userId');
    // Don't remove token here - just log the error
  }

  // More aggressive auto-refresh to ensure assessments are always updated
  useEffect(() => {
    if (tabValue !== 2) return;

    api.get('/assessment')
      .then(response => {
        if (Array.isArray(response.data)) {
          const sortedAssessments = response.data.sort((a, b) =>
            new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
          );
          setAssessments(sortedAssessments);
          localStorage.setItem('cachedAssessments', JSON.stringify(sortedAssessments));
          localStorage.setItem('assessmentCacheTimestamp', Date.now().toString());
        }
      })
      .catch(console.error);

    const interval = setInterval(() => {
      api.get('/assessment')
        .then(response => {
          if (Array.isArray(response.data)) {
            const sortedAssessments = response.data.sort((a, b) =>
              new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
            );
            setAssessments(sortedAssessments);
            localStorage.setItem('cachedAssessments', JSON.stringify(sortedAssessments));
            localStorage.setItem('assessmentCacheTimestamp', Date.now().toString());
          }
        })
        .catch(console.error);
    }, 30000);

    return () => clearInterval(interval);
  }, [tabValue]);

  // Show login prompt if not authenticated
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

  // Clear incorrect token or bad auth data if user object incomplete
  useEffect(() => {
    if (user && (!user.id || !user.email)) {
      console.error('User object is incomplete:', user);
      localStorage.removeItem('userId');
      // Don't remove token here - just log the error
    }
  }, [user]);


  // Loading state
  if (loading && !appointments.length && !documents.length && !assessments.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            User Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                // Force refresh assessments
                api.get('/assessment')
                  .then(response => {
                    if (Array.isArray(response.data) && response.data.length > 0) {
                      console.log('Manual refresh found', response.data.length, 'assessments');
                      // Sort by date
                      const sortedAssessments = response.data.sort((a, b) =>
                        new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
                      );
                      setAssessments(sortedAssessments);
                    } else {
                      console.log('Manual refresh found no assessments');
                    }
                  })
                  .catch(err => {
                    console.error('Error in manual assessment refresh:', err);
                  });
              }}
            >
              Refresh Data
            </Button>
            {user?.isAdmin && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/admin-dashboard')}
              >
                Go to Admin Dashboard
              </Button>
            )}
            <Button
              variant="outlined"
              color="error"
              onClick={logout}
            >
              Logout
            </Button>
          </Box>
        </Box>


        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="dashboard tabs"
            variant="fullWidth"
          >
            <Tab
              label="Appointments"
              icon={<EventIcon />}
              iconPosition="start"
            />
            <Tab
              label="Documents"
              icon={<DocumentIcon />}
              iconPosition="start"
            />
            <Tab
              label="Assessments"
              icon={<AssessmentIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Appointments Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Your Appointments
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAppointmentDialogOpen}
            >
              Book Appointment
            </Button>
          </Box>

          {appointments.length === 0 ? (
            <Alert severity="info">
              You don't have any appointments yet. Book your first appointment now.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {appointments.map((appointment) => (
                <Grid item xs={12} md={6} key={appointment._id}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <HospitalIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          {appointment.appointmentType === 'surgeon' ? 'Surgeon Appointment' :
                            appointment.appointmentType === 'allied_health' ? 'Allied Health Appointment' :
                              'Imaging Appointment'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body1" color="text.secondary">
                          Provider: {appointment.provider}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body1" color="text.secondary">
                          Date: {new Date(appointment.date).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body1" color="text.secondary">
                          Time: {appointment.time}
                        </Typography>
                      </Box>

                      {appointment.notes && (
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          Notes: {appointment.notes}
                        </Typography>
                      )}

                      <Chip
                        label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        color={
                          appointment.status === 'scheduled' ? 'primary' :
                            appointment.status === 'completed' ? 'success' :
                              appointment.status === 'cancelled' ? 'error' : 'warning'
                        }
                        size="small"
                        sx={{ mt: 2 }}
                      />
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => {/* Handle edit */ }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => {/* Handle delete */ }}
                      >
                        Cancel
                      </Button>
                      {appointment.status === 'completed' && (
                        <Button
                          size="small"
                          color="secondary"
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
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={handleDocumentDialogOpen}
            >
              Upload Document
            </Button>
          </Box>

          {documents.length === 0 ? (
            <Alert severity="info">
              You don't have any documents yet. Upload your first document now.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {documents.map((document) => (
                <Grid item xs={12} md={6} key={document._id}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DocumentIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          {document.documentType.split('_').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {document.originalName}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Document Date: {new Date(document.documentDate).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
                        </Typography>
                      </Box>

                      {document.description && (
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          {document.description}
                        </Typography>
                      )}

                      {document.tags && document.tags.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {document.tags.map((tag, index) => (
                            <Chip key={index} label={tag} size="small" />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadDocument(document._id)}
                      >
                        Download
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => {/* Handle edit */ }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => {/* Handle delete */ }}
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
              {/* No test data buttons in production */}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleStartNewAssessment}
              >
                New Assessment
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            {assessments.length === 0 ? (
              <>
                <Alert severity="info" sx={{ mb: 3 }}>
                  You don't have any assessments yet. Start your first assessment now.
                </Alert>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    try {
                      // Force a direct check of all assessments without auth
                      const directResponse = await api.get('/assessment');
                      console.log('Direct check of all assessments:', directResponse.data);
                      if (Array.isArray(directResponse.data) && directResponse.data.length > 0) {
                        setAssessments(directResponse.data);
                      } else {
                        console.log('No assessments found in direct check');
                      }
                    } catch (e) {
                      console.error('Error checking assessments directly:', e);
                    }
                  }}
                  sx={{ mb: 2 }}
                >
                  Debug: Check for Assessments
                </Button>
                <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Getting Started with Assessments
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Complete a pain assessment to get personalized treatment recommendations.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleStartNewAssessment}
                      startIcon={<AssessmentIcon />}
                      size="large"
                      sx={{ py: 1.5, px: 3 }}
                    >
                      Start Your First Assessment
                    </Button>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      If no assessments appear above, click the "Refresh Data" button in the top right.
                    </Typography>
                  </Box>
                </Paper>
              </>
            ) : (
              <>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body1" fontWeight="bold">
                    {assessments.length} assessment{assessments.length !== 1 ? 's' : ''} found
                  </Typography>
                  <Typography variant="body2">
                    Click on any assessment to view detailed results.
                  </Typography>
                </Alert>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing your pain assessments from the database.
                  </Typography>
                  <Button
                    variant="text"
                    color="primary"
                    size="small"
                    onClick={() => {
                      // Force immediate refresh
                      api.get('/assessment')
                        .then(response => {
                          if (Array.isArray(response.data) && response.data.length > 0) {
                            const sortedAssessments = response.data.sort((a, b) =>
                              new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
                            );
                            setAssessments(sortedAssessments);
                            console.log('Manual mini-refresh: updated to', sortedAssessments.length, 'assessments');
                          }
                        });
                    }}
                  >
                    Refresh List
                  </Button>
                </Box>
              </>
            )}
          </Box>

          {assessments.length > 0 && (
            <List>
              {assessments.map((assessment) => (
                <Paper key={assessment._id} elevation={2} sx={{ mb: 2 }}>
                  <ListItem
                    secondaryAction={
                      <Box sx={{ display: 'flex' }}>
                        <Tooltip title="View Assessment Results">
                          <IconButton edge="end" onClick={() => handleViewAssessment(assessment._id)}>
                            <AssessmentIcon color="primary" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      <EventIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography>
                            Assessment from {formatDate(assessment.timestamp || assessment.createdAt)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                            ID: {assessment._id ? (typeof assessment._id === 'string' ? assessment._id.substring(0, 8) : String(assessment._id).substring(0, 8)) : 'Unknown'}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {assessment.painLevels && Object.keys(assessment.painLevels).length > 0 ? (
                              <>
                                Pain Level: {getAveragePainLevel(assessment.painLevels)} |
                                Pain Points: {Object.keys(assessment.painLevels || {}).length}
                              </>
                            ) : (
                              <i>Pain data not available</i>
                            )}
                          </Typography>

                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {assessment.imagingStudies && assessment.imagingStudies.length > 0 && (
                              <Chip
                                label="Has Medical Imaging"
                                size="small"
                                color="primary"
                                sx={{ mr: 0.5 }}
                              />
                            )}

                            {assessment.surgicalHistory?.hasPreviousSurgery && (
                              <Chip
                                label="Previous Surgery"
                                size="small"
                                color="secondary"
                                sx={{ mr: 0.5 }}
                              />
                            )}

                            {assessment.medicalConditions && Object.values(assessment.medicalConditions).some(v => v === true) && (
                              <Chip
                                label="Medical Conditions"
                                size="small"
                                color="info"
                                sx={{ mr: 0.5 }}
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

      {/* Appointment Dialog */}
      <Dialog open={appointmentDialogOpen} onClose={handleAppointmentDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Book New Appointment</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" error={!!appointmentFormErrors.appointmentType}>
            <InputLabel id="appointment-type-label">Appointment Type</InputLabel>
            <Select
              labelId="appointment-type-label"
              id="appointmentType"
              name="appointmentType"
              value={appointmentFormData.appointmentType}
              onChange={handleAppointmentFormChange}
              label="Appointment Type"
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
                  />
                )}
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
                  />
                )}
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAppointmentDialogClose}>Cancel</Button>
          <Button
            onClick={handleAppointmentSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Book Appointment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Upload Dialog */}
      <Dialog open={documentDialogOpen} onClose={handleDocumentDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Medical Document</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<UploadIcon />}
              sx={{ py: 1.5 }}
            >
              Select File
              <input
                type="file"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {selectedFile.name}
              </Typography>
            )}
            {documentFormErrors.file && (
              <Typography variant="caption" color="error">
                {documentFormErrors.file}
              </Typography>
            )}
          </Box>

          <FormControl fullWidth margin="normal" error={!!documentFormErrors.documentType}>
            <InputLabel id="document-type-label">Document Type</InputLabel>
            <Select
              labelId="document-type-label"
              id="documentType"
              name="documentType"
              value={documentFormData.documentType}
              onChange={handleDocumentFormChange}
              label="Document Type"
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDocumentDialogClose}>Cancel</Button>
          <Button
            onClick={handleDocumentSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload Document'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserDashboard;
