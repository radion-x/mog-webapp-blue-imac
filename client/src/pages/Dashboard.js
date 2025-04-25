import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import {
  LocalHospital as HospitalIcon,
  Healing as HealingIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';

// Constants for categorization
const PAIN_THRESHOLD_HIGH = 7; // Pain levels >= 7 are considered high

const Dashboard = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  // Account creation state
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const handleStartNew = () => {
    // Clear assessment data from localStorage
    localStorage.removeItem('assessmentId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    // For logged in users, navigate directly to assessment page
    // For non-logged in users, navigate to intro page
    navigate(isAuthenticated ? '/assessment' : '/');
  };

  // Account dialog handlers
  const handleAccountDialogOpen = () => {
    // Pre-fill form with any data we have
    setFormData({
      name: localStorage.getItem('userName') || '',
      email: localStorage.getItem('userEmail') || '',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setRegisterError('');
    setAccountDialogOpen(true);
  };

  const handleAccountDialogClose = () => {
    setAccountDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Email is invalid (must include domain like .com, .net, etc.)';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAccountCreate = async () => {
    if (!validateForm()) return;
    
    setRegisterLoading(true);
    setRegisterError('');
    
    try {
      const { name, email, password } = formData;
      
      // Register the user
      console.log('Sending registration request with email:', email);
      const response = await api.post('/auth/register', { 
        name, 
        email, 
        password 
      });
      
      console.log('Registration successful!');
      
      if (response.data.token) {
        // Log the user in
        console.log('Token received, logging in...');
        const success = await login(response.data.token);
        
        if (success) {
          // Link assessment to user if it exists
          console.log('Login successful, checking for assessment ID...');
          const assessmentId = location.state?.assessmentId || localStorage.getItem('assessmentId');
          if (assessmentId) {
            try {
              console.log('Linking assessment to user...');
              await api.put(`/assessment/${assessmentId}/link-user`, {
                userId: response.data.user.id
              });
              console.log('Assessment linked successfully');
            } catch (err) {
              console.error('Error linking assessment to user:', err);
              // Continue even if linking fails
            }
          }
          
          // Close dialog and navigate to user dashboard
          setAccountDialogOpen(false);
          navigate('/user-dashboard');
        } else {
          setRegisterError('Registration was successful but failed to set user session');
        }
      } else {
        setRegisterError('Registration successful but no token received');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        console.error('Server response:', error.response.data);
        
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          // Handle validation errors from server
          const serverErrors = {};
          error.response.data.errors.forEach(err => {
            serverErrors[err.param] = err.msg;
          });
          setFormErrors(serverErrors);
          setRegisterError('Please correct the errors in the form');
        } else if (error.response.data.msg) {
          setRegisterError(error.response.data.msg);
        } else {
          setRegisterError(`Server error: ${error.response.status}`);
        }
      } else if (error.message) {
        setRegisterError(`Failed to register: ${error.message}`);
      } else {
        setRegisterError('Failed to register. Please try again.');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const { isAuthenticated } = useAuth(); // Keep this

  useEffect(() => {
    const fetchAssessmentData = async () => {
      setLoading(true);
      try {
        // Check multiple sources for assessment ID:
        // 1. URL parameters
        // 2. Location state
        // 3. LocalStorage
        const queryParams = new URLSearchParams(window.location.search);
        const idFromQuery = queryParams.get('id');
        
        console.log('Dashboard location state:', location.state);
        console.log('ID from query params:', idFromQuery);
        
        const assessmentId = idFromQuery || 
                           location.state?.assessmentId || 
                           localStorage.getItem('assessmentId');
                           
        console.log('Using assessment ID:', assessmentId);
        
        if (!assessmentId) {
          console.error('No assessment ID found in any source');
          // Don't throw error here, just show a user-friendly message
          setError('Assessment data not found. Please start a new assessment.');
          setLoading(false);
          return;
        }

        // Store the ID in localStorage to ensure persistence
        localStorage.setItem('assessmentId', assessmentId);
        
        // Also add to known assessment IDs registry for user dashboard display
        try {
          const knownAssessmentIds = JSON.parse(localStorage.getItem('knownAssessmentIds') || '[]');
          if (!knownAssessmentIds.includes(assessmentId)) {
            knownAssessmentIds.push(assessmentId);
            localStorage.setItem('knownAssessmentIds', JSON.stringify(knownAssessmentIds));
            console.log('Added assessment to known IDs registry:', assessmentId);
          }
        } catch (e) {
          console.error('Error updating known assessment IDs:', e);
        }

        console.log('Fetching assessment data from API...');
        const response = await api.get(`/assessment/${assessmentId}`);
        console.log('Assessment data received:', response.data);
        
        if (!response.data) {
          throw new Error('No assessment data returned from server');
        }
        
        setAssessmentData(response.data);
        determineRecommendation(response.data);
        
        // After loading assessment data, fetch the AI-generated summary
        fetchAiSummary(assessmentId);
      } catch (err) {
        console.error('Error fetching assessment data:', err);
        setError(err.message || 'Failed to load assessment data');
      } finally {
        setLoading(false);
      }
    };
    
    // Function to fetch AI-generated summary
    const fetchAiSummary = async (assessmentId) => {
      try {
        setSummaryLoading(true);
        console.log('Fetching AI summary for assessment:', assessmentId);
        
        const summaryResponse = await api.get(`/assessment/${assessmentId}/summary`);
        console.log('AI Summary received:', summaryResponse.data);
        
        if (summaryResponse.data && summaryResponse.data.summary) {
          setAiSummary(summaryResponse.data.summary);
        } else {
          console.warn('No summary data received from API');
          setAiSummary('No summary available for this assessment.');
        }
      } catch (err) {
        console.error('Error fetching AI summary:', err);
        setAiSummary('Unable to generate assessment summary at this time.');
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchAssessmentData();
  }, [location.search, location.state, navigate, isAuthenticated]); // Also refresh when auth state or navigation changes

  const determineRecommendation = (data) => {
    // Calculate average pain score
    const painScores = Object.values(data.painLevels || {});
    const averagePain = painScores.length > 0 
      ? painScores.reduce((sum, score) => sum + score, 0) / painScores.length 
      : 0;

    // Get medical history info
    const hasPreviousSurgery = data.treatmentHistory?.previousSurgeries?.length > 0;
    const hasMedicalImaging = data.treatmentHistory?.imaging?.length > 0;

    // Determine recommendation pathway
    if (averagePain >= PAIN_THRESHOLD_HIGH) {
      if (!hasMedicalImaging) {
        setRecommendation({
          type: 'imaging',
          title: 'Medical Imaging Recommended',
          description: 'Based on your high pain levels, we recommend getting an MRI for proper diagnosis.',
          icon: <WarningIcon />,
          color: theme.palette.warning.main,
          action: isAuthenticated ? 'Schedule MRI' : 'Create Account'
        });
      } else {
        setRecommendation({
          type: 'surgeon',
          title: 'Surgical Consultation Recommended',
          description: 'Given your pain levels and existing imaging, we recommend consulting with a surgeon.',
          icon: <HospitalIcon />,
          color: theme.palette.error.main,
          action: isAuthenticated ? 'Book Surgeon Appointment' : 'Create Account'
        });
      }
    } else {
      setRecommendation({
        type: 'allied',
        title: 'Allied Health Recommended',
        description: 'We recommend working with allied health professionals for pain management.',
        icon: <HealingIcon />,
        color: theme.palette.success.main,
        action: isAuthenticated ? 'Find Allied Health Professional' : 'Create Account'
      });
    }
  };

  // Helper function to get color based on pain level
  const getPainColor = (painLevel) => {
    if (painLevel >= 7) return theme.palette.error.main;
    if (painLevel >= 4) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const renderPainChart = () => {
    if (!assessmentData?.painLevels) return null;

    // Calculate average pain level
    const painScores = Object.values(assessmentData.painLevels);
    const averagePain = painScores.length > 0 
      ? Math.round((painScores.reduce((sum, score) => sum + score, 0) / painScores.length) * 10) / 10
      : 0;

    const data = [
      {
        name: 'Pain Level',
        value: averagePain * 10, // Scale to percentage (0-100)
        fill: getPainColor(averagePain)
      }
    ];

    return (
      <Box sx={{ width: '100%', height: 300, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="60%" 
            outerRadius="100%" 
            barSize={20} 
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={30}
              fill="#82ca9d"
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: getPainColor(averagePain) }}>
            {averagePain}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Average Pain Level
          </Typography>
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    // Container adjusted for Layout
    <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 4 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'white' }}> {/* White text */}
            Assessment Dashboard
          </Typography>
        </Grid>

        {/* Recommendation Card styled */}
        {recommendation && (
          <Grid item xs={12}>
            <Paper
              elevation={6}
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: 'rgba(30, 40, 55, 0.9)', // Darker background
                border: `1px solid ${recommendation.color}50`, // Use recommendation color for border
                color: 'white'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ color: recommendation.color }}>
                  {recommendation.icon}
                </Box>
                <Typography variant="h6" sx={{ color: recommendation.color, fontWeight: 'bold' }}>
                  {recommendation.title}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
                {recommendation.description}
              </Typography>
              {/* Button styled like HomePage */}
              <Button
                variant="contained"
                onClick={() => {
                  if (isAuthenticated) {
                    if (recommendation.type === 'imaging' || recommendation.type === 'surgeon' || recommendation.type === 'allied') {
                      navigate('/user-dashboard'); // Go to user dashboard to book
                    }
                  } else {
                    handleAccountDialogOpen();
                  }
                }}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#1a1a2e',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: 'white' }
                }}
              >
                {recommendation.action}
              </Button>
            </Paper>
          </Grid>
        )}

        {/* AI-Generated Summary Card styled */}
        <Grid item xs={12}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3, mb: 3, backgroundColor: 'rgba(30, 40, 55, 0.9)', color: 'white' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#bb86fc', fontWeight: 'bold' }}> {/* Adjusted color */}
              Clinical Assessment Summary (AI-Generated)
            </Typography>

            {summaryLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                <CircularProgress size={24} sx={{ color: 'white' }} />
                <Typography variant="body2" sx={{ ml: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Generating clinical summary...
                </Typography>
              </Box>
            ) : aiSummary ? (
              <Typography variant="body1" sx={{ lineHeight: 1.7, fontStyle: 'italic', pl: 2, borderLeft: `4px solid #bb86fc`, color: 'rgba(255, 255, 255, 0.9)' }}>
                {aiSummary}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                No summary available for this assessment.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Pain Chart styled */}
        <Grid item xs={12} md={8}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3, backgroundColor: 'rgba(30, 40, 55, 0.9)', color: 'white' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Pain Levels
            </Typography>
            {renderPainChart()} {/* Ensure renderPainChart uses dark theme compatible colors */}
          </Paper>
        </Grid>

        {/* Timeline Card styled */}
        <Grid item xs={12} md={4}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3, backgroundColor: 'rgba(30, 40, 55, 0.9)', color: 'white' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Assessment Timeline
            </Typography>
            {/* Timeline styled */}
            <Timeline sx={{ [`& .MuiTimelineItem-root::before`]: { flex: 0, padding: 0 }, '& .MuiTimelineDot-root': { boxShadow: 'none' } }}>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot sx={{ bgcolor: '#bb86fc' }}> {/* Dot color */}
                    <AssessmentIcon />
                  </TimelineDot>
                  <TimelineConnector sx={{ bgcolor: 'rgba(255, 255, 255, 0.23)' }} /> {/* Connector color */}
                </TimelineSeparator>
                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Pain Assessment Completed
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {new Date(assessmentData?.timestamp).toLocaleDateString()}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
              {assessmentData?.surgicalHistory?.hasPreviousSurgery && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot sx={{ bgcolor: '#03dac6' }}> {/* Dot color */}
                      <HospitalIcon />
                    </TimelineDot>
                    <TimelineConnector sx={{ bgcolor: 'rgba(255, 255, 255, 0.23)' }} />
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Previous Surgeries
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {assessmentData.surgicalHistory.surgeries?.length || 0} recorded
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}
              {assessmentData?.imagingStudies?.some(study => study.hasHad) && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot sx={{ bgcolor: '#f48fb1' }}> {/* Dot color */}
                      <WarningIcon />
                    </TimelineDot>
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Medical Imaging
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {assessmentData.imagingStudies.filter(study => study.hasHad).length} scans recorded
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}
            </Timeline>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              {/* Button styled */}
              <Button
                variant="outlined"
                onClick={() => navigate('/summary', { state: { assessmentId: location.state?.assessmentId || localStorage.getItem('assessmentId') } })}
                sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 600, color: '#bb86fc', borderColor: 'rgba(187, 134, 252, 0.5)', '&:hover': { borderColor: '#bb86fc', backgroundColor: 'rgba(187, 134, 252, 0.1)' } }}
              >
                View Detailed Summary
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Action Buttons styled */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: 1, borderColor: 'rgba(255, 255, 255, 0.23)' }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/assessment')}
                sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 600, color: '#bb86fc', borderColor: 'rgba(187, 134, 252, 0.5)', '&:hover': { borderColor: '#bb86fc', backgroundColor: 'rgba(187, 134, 252, 0.1)' } }}
              >
                Back to Assessment
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate('/user-dashboard')}
                sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 600, color: '#bb86fc', borderColor: 'rgba(187, 134, 252, 0.5)', '&:hover': { borderColor: '#bb86fc', backgroundColor: 'rgba(187, 134, 252, 0.1)' } }}
              >
                User Dashboard
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {!isAuthenticated && (
                <Button
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={handleAccountDialogOpen}
                  sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 600, color: '#bb86fc', borderColor: 'rgba(187, 134, 252, 0.5)', '&:hover': { borderColor: '#bb86fc', backgroundColor: 'rgba(187, 134, 252, 0.1)' } }}
                >
                  Create Account
                </Button>
              )}

              {/* Start New button styled like HomePage */}
              <Button
                variant="contained"
                onClick={handleStartNew}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#1a1a2e',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    transform: 'scale(1.03)',
                    boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
                  },
                  transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                }}
              >
                Start New Assessment
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Account Creation Dialog styled */}
      <Dialog
        open={accountDialogOpen}
        onClose={handleAccountDialogClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { backgroundColor: '#1f2a3e', color: 'white' } }} // Dark background
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Create Your Account
          <IconButton
            aria-label="close"
            onClick={handleAccountDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'rgba(255, 255, 255, 0.7)' }} // Adjusted color
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.23)' }}> {/* Divider color */}
          {registerError && (
            <Alert severity="error" variant="filled" sx={{ mb: 2, '.MuiAlert-message': { color: 'rgba(0, 0, 0, 0.87)' } }}>
              {registerError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
              Create an account to save your assessment data and book appointments with healthcare providers.
            </Typography>

            {/* TextFields styled */}
            <TextField
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name || "Enter your full name (at least 2 characters)"}
              disabled={registerLoading}
              variant="filled"
              sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, '.MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' } }}
            />

            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email || "Use a valid email format (e.g., name@example.com)"}
              disabled={registerLoading}
              placeholder="name@example.com"
              variant="filled"
              sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, '.MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' } }}
            />

            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleInputChange}
              error={!!formErrors.password}
              helperText={formErrors.password || "Minimum 6 characters required"}
              disabled={registerLoading}
              variant="filled"
              sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, '.MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' } }}
            />

            <TextField
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword || "Repeat your password exactly"}
              disabled={registerLoading}
              variant="filled"
              sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, '.MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' } }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleAccountDialogClose}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }} // Adjusted color
            disabled={registerLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccountCreate}
            variant="contained"
            disabled={registerLoading}
            sx={{ borderRadius: 2, px: 3, backgroundColor: '#bb86fc', '&:hover': { backgroundColor: '#a16ae8' } }} // Example purple button
          >
            {registerLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
