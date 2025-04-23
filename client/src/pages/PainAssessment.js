import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/axios';
import BodyModel3D from '../components/BodyModel3D';
import SimpleBodyModel from '../components/SimpleBodyModel';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  Box,
  Container,
  Paper,
  Typography,
  Alert,
  Button,
  styled,
  useTheme,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Tooltip,
  IconButton,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  RadioGroup,
  Radio,
  Stack
} from '@mui/material';
import { 
  ArrowBack, 
  ArrowForward, 
  Help,
  CheckCircleOutline,
  RestartAlt,
  Warning,
  BugReport as BugReportIcon
} from '@mui/icons-material';

// Import THREE patching early to ensure it's available
import { PatchedTHREE as THREE, testThreeJs } from '../utils/threeTest';

// Test if THREE.js is working - run the test immediately
let threeJsWorking = false;
try {
  console.log('Testing THREE.js functionality...');
  threeJsWorking = testThreeJs();
  console.log('THREE.js test result:', threeJsWorking ? 'SUCCESS' : 'FAILED');
} catch (error) {
  console.error('THREE.js initialization test error:', error);
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}));

const steps = ['Treatment History', 'Pain Assessment', 'Summary'];

const PainAssessment = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [painData, setPainData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [modelType, setModelType] = useState('3d'); // '3d', '2d', or 'simple'
  const [debugMode, setDebugMode] = useState(false);
const [threeJsError, setThreeJsError] = useState(null);
const [painDescription, setPainDescription] = useState('');
const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Error handler for THREE.js errors
  const handleThreeJsError = (error) => {
    console.error('THREE.js error detected:', error);
    setThreeJsError(error);
    setShowErrorDialog(true);
    // Switch to simple model if error persists
    if (error.toString().includes('WebGL') || error.toString().includes('THREE')) {
      setModelType('simple');
    }
  };

  // Reset THREE.js error state and try 3D model again
  const resetThreeJsError = () => {
    console.log('Resetting THREE.js error state');
    localStorage.removeItem('three_js_error');
    setThreeJsError(null);
    setModelType('3d');
    setShowErrorDialog(false);
    // Force reload only if necessary
    if (window.location.hash === '#force-reload') {
      window.location.reload();
    } else {
      window.location.hash = 'force-reload';
    }
  };

  useEffect(() => {
    // Get assessment ID from URL parameters or location state
    const queryParams = new URLSearchParams(window.location.search);
    const idFromQuery = queryParams.get('id');
    const idFromState = location.state?.assessmentId;
    const idFromStorage = localStorage.getItem('assessmentId');
    
    console.log('Pain Assessment - ID sources:', {
      query: idFromQuery,
      state: idFromState,
      storage: idFromStorage
    });
    
    // If no assessment ID is available, we need to create one
    if (!idFromQuery && !idFromState && !idFromStorage) {
      console.log('No assessment ID found. Creating a temporary one...');
      // Create a temporary assessment
      const createTemporaryAssessment = async () => {
        try {
          setIsLoading(true);
          const response = await api.post('/assessment', {
            name: 'Temporary User',
            email: 'temp@example.com'
          });
          
          console.log('Temporary assessment created:', response.data);
          
          if (response.data && response.data._id) {
            const newAssessmentId = response.data._id;
            localStorage.setItem('assessmentId', newAssessmentId);
            localStorage.setItem('userName', 'Temporary User');
            localStorage.setItem('userEmail', 'temp@example.com');
            
            // Also add to known assessment IDs registry for user dashboard display
            try {
              const knownAssessmentIds = JSON.parse(localStorage.getItem('knownAssessmentIds') || '[]');
              if (!knownAssessmentIds.includes(newAssessmentId)) {
                knownAssessmentIds.push(newAssessmentId);
                localStorage.setItem('knownAssessmentIds', JSON.stringify(knownAssessmentIds));
                console.log('Added new assessment to known IDs registry:', newAssessmentId);
              }
            } catch (e) {
              console.error('Error updating known assessment IDs:', e);
            }
            
            // This will force a re-render without reloading the page
            window.history.replaceState(
              {}, 
              document.title, 
              `/assessment?id=${response.data._id}`
            );
          }
        } catch (error) {
          console.error('Error creating temporary assessment:', error);
          setError('Failed to initialize assessment. Please refresh the page.');
        } finally {
          setIsLoading(false);
        }
      };
      
      createTemporaryAssessment();
    } else {
      // Use existing assessment ID
      const assessmentId = idFromQuery || idFromState || idFromStorage;
      console.log('Using assessment ID:', assessmentId);
      localStorage.setItem('assessmentId', assessmentId);
      
      // Also add to known assessment IDs registry for user dashboard display
      try {
        const knownAssessmentIds = JSON.parse(localStorage.getItem('knownAssessmentIds') || '[]');
        if (assessmentId && !knownAssessmentIds.includes(assessmentId)) {
          knownAssessmentIds.push(assessmentId);
          localStorage.setItem('knownAssessmentIds', JSON.stringify(knownAssessmentIds));
          console.log('Added existing assessment to known IDs registry:', assessmentId);
        }
      } catch (e) {
        console.error('Error updating known assessment IDs:', e);
      }
      
      // Fetch assessment data to get user info
      const fetchAssessmentData = async () => {
        try {
          const response = await api.get(`/assessment/${assessmentId}`);
          if (response.data && response.data.userInfo) {
            localStorage.setItem('userName', response.data.userInfo.name);
            localStorage.setItem('userEmail', response.data.userInfo.email);
            console.log('User info updated from assessment data');
          }
        } catch (error) {
          console.error('Error fetching assessment data:', error);
        }
      };
      
      fetchAssessmentData();
    }
    
    // Add global error handler for THREE.js errors
    const handleError = (event) => {
      const errorMsg = event.error?.message || event.message || '';
      
      // Check for specific BugReportIcon error
      if (errorMsg.includes('BugReportIcon is not defined')) {
        console.error('BugReportIcon error detected - this is a component import issue');
        // We can handle this silently - the icon will be missing but functionality can continue
        return;
      }
      
      // Check for THREE.js related errors
      if (errorMsg.includes('primaries') || 
          errorMsg.includes('three') || 
          errorMsg.includes('THREE') || 
          errorMsg.includes('WebGL')) {
        handleThreeJsError(event.error || new Error(errorMsg));
      }
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, [window.location.search, location]);

  const handlePainDataChange = (data) => {
    console.log('Pain data changed:', data);
    setPainData(data);
    setError('');
    // Only show success if we have valid pain points with non-zero pain levels
    const hasValidPainPoints = Object.values(data || {}).some(painLevel => painLevel > 0);
    setShowSuccess(hasValidPainPoints);
  };

  // Toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(prevMode => !prevMode);
  };

  const handleSubmit = async () => {
    // Check if we have any pain data and at least one point with pain level > 0
    const hasValidPainPoints = painData && Object.values(painData).some(painLevel => painLevel > 0);
    
    if (!hasValidPainPoints) {
      setError('Please mark at least one pain point with a pain level before proceeding');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const userInfo = {
        name: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail')
      };
      const assessmentId = localStorage.getItem('assessmentId');
      
      if (!assessmentId) {
        setError('No assessment ID found. Please try starting again with a new assessment.');
        setIsLoading(false);
        return;
      }
      
      console.log('Submitting assessment with ID:', assessmentId);
      
      // Prepare assessment data
      const assessmentData = {
        userId: assessmentId,
        painLevels: painData,
        painDescription: painDescription, // Add description
        timestamp: new Date().toISOString()
      };

      console.log('Submitting assessment data:', assessmentData);

      // Post the assessment data
      try {
        // Add timestamp to assessment data if not already present
        if (!assessmentData.timestamp) {
          assessmentData.timestamp = new Date().toISOString();
        }
        
        console.log('Saving pain assessment with data:', JSON.stringify(assessmentData));
        
        // Now that we definitely have a timestamp, create or update a user link for this assessment
        try {
          const token = localStorage.getItem('token');
          if (token) {
            // If user is authenticated, link this assessment to their account
            await api.put(`/assessment/${assessmentId}/link-user`, { 
              userId: api.defaults.headers.common['x-auth-token'] ? 'user-from-token' : localStorage.getItem('userId')
            });
            console.log('Linked assessment to authenticated user account');
          }
        } catch (linkError) {
          console.error('Error linking assessment to user account:', linkError);
          // Continue anyway - this isn't critical
        }
        
        const response = await api.post('/assessment/pain-assessment', assessmentData);
        console.log('Assessment saved successfully:', response.data);
        
        // Ensure assessment ID is stored in localStorage before navigation
        localStorage.setItem('assessmentId', assessmentId);
        
        // Store the assessment data in localStorage for user dashboard access
        try {
          // Get the realAssessments array from localStorage or create empty array
          const realAssessments = JSON.parse(localStorage.getItem('realAssessments') || '[]');
          
          // Add the current assessment data - use the server response data which is more complete
          const assessmentToSave = {
            ...response.data, // Take all fields from server response
            _id: assessmentId,
            timestamp: assessmentData.timestamp,
            painLevels: painData,
            userInfo: {
              name: localStorage.getItem('userName') || 'User',
              email: localStorage.getItem('userEmail') || 'user@example.com'
            },
            isRealData: true, // Flag to identify real user assessment data
            isTempData: false // Explicitly mark as not temporary
          };
          
          // Remove any old versions of this assessment
          const filteredAssessments = realAssessments.filter(a => a._id !== assessmentId);
          
          // Add the new assessment
          filteredAssessments.push(assessmentToSave);
          
          // Save back to localStorage
          localStorage.setItem('realAssessments', JSON.stringify(filteredAssessments));
          console.log('Saved assessment to localStorage for dashboard access:', assessmentId);
          
          // Also update knownAssessmentIds to include this ID
          try {
            const knownIds = JSON.parse(localStorage.getItem('knownAssessmentIds') || '[]');
            if (!knownIds.includes(assessmentId)) {
              knownIds.push(assessmentId);
              localStorage.setItem('knownAssessmentIds', JSON.stringify(knownIds));
              console.log('Updated knownAssessmentIds to include:', assessmentId);
            }
          } catch (e) {
            console.error('Error updating knownAssessmentIds:', e);
          }
        } catch (e) {
          console.error('Error saving assessment to localStorage:', e);
        }
        
        // Immediate navigate to dashboard, regardless of success
        setIsLoading(false);
        console.log('Navigating to dashboard...');
        
        // Before redirecting, ensure refreshed assessments will be shown
        try {
          // Make a direct server request to link this assessment with the user
          if (localStorage.getItem('token') && localStorage.getItem('userId')) {
            await api.put(`/assessment/${assessmentId}/link-user`, {
              userId: localStorage.getItem('userId')
            });
            console.log('Successfully linked assessment to user before redirecting');
          }
        } catch (linkErr) {
          console.error('Error linking assessment before redirect:', linkErr);
        }
        
        // Force a full page redirect instead of client-side navigation
        window.location.href = `/dashboard?id=${assessmentId}`;
      } catch (apiError) {
        console.error('API Error:', apiError);
        const errorMessage = apiError.response?.data?.message || 
                           apiError.response?.data?.error || 
                           'Failed to save pain assessment. Please try again.';
        setError(`API Error: ${errorMessage}`);
        setIsLoading(false);
        
        // Ensure assessment ID is stored in localStorage before navigation
        localStorage.setItem('assessmentId', assessmentId);
        
        // Even with error, save the assessment data in localStorage for user dashboard access
        try {
          // Get the realAssessments array from localStorage or create empty array
          const realAssessments = JSON.parse(localStorage.getItem('realAssessments') || '[]');
          
          // Add the current assessment data
          const assessmentToSave = {
            _id: assessmentId,
            timestamp: new Date().toISOString(), // Fix: use current timestamp directly
            painLevels: painData,
            userInfo: {
              name: localStorage.getItem('userName') || 'User',
              email: localStorage.getItem('userEmail') || 'user@example.com'
            },
            isRealData: true, // Flag to identify real user assessment data
            hasError: true // Flag to indicate there was an error saving
          };
          
          // Only add if not already present
          if (!realAssessments.some(a => a._id === assessmentId)) {
            realAssessments.push(assessmentToSave);
            
            // Save back to localStorage
            localStorage.setItem('realAssessments', JSON.stringify(realAssessments));
            console.log('Saved error assessment to localStorage for dashboard access:', assessmentId);
          }
        } catch (e) {
          console.error('Error saving assessment to localStorage:', e);
        }
        
        // Before redirecting, try one more time to ensure this assessment is linked with user
        try {
          // Make a direct server request to link this assessment with the user
          if (localStorage.getItem('token') && localStorage.getItem('userId')) {
            await api.put(`/assessment/${assessmentId}/link-user`, {
              userId: localStorage.getItem('userId')
            });
            console.log('Successfully linked assessment to user before redirecting (error path)');
          }
        } catch (linkErr) {
          console.error('Error linking assessment before redirect (error path):', linkErr);
        }

        // Even with error, try navigation to dashboard
        console.log('Error occurred but still navigating to dashboard...');
        window.location.href = `/dashboard?id=${assessmentId}`;
      }
    } catch (err) {
      console.error('General error in form submission:', err);
      setError(`Submission error: ${err.message}`);
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'grey.50',
      py: 2,
      pb: 4, // Added bottom padding
      overflow: 'auto', // Ensure scrolling is available
      backgroundImage: 'linear-gradient(to bottom right, #f7fafc, #edf2f7)'
    }}>
      <Container maxWidth="lg">
        <StyledPaper elevation={2} sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Stepper activeStep={1} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.9rem' } }}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            mb: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="h4"
                align="center"
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1a365d 30%, #2b6cb0 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Pain Assessment
              </Typography>
              <Tooltip title="Click on the highlighted points on the model to mark your pain levels.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <Help fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Toggle debug mode">
                <IconButton 
                  onClick={toggleDebugMode} 
                  color={debugMode ? "error" : "default"}
                  sx={{ mr: 1 }}
                >
                  <BugReportIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Select visualization type">
                <Box>
                  <RadioGroup
                    row
                    aria-label="visualization-type"
                    name="visualization-type"
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                  >
                    <FormControlLabel value="3d" control={<Radio size="small" />} label="3D" />
                    <FormControlLabel value="simple" control={<Radio size="small" />} label="Simple" />
                  </RadioGroup>
                </Box>
              </Tooltip>
            </Box>
          </Box>

          {error && (
            <Fade in={true}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  borderRadius: 1,
                  '& .MuiAlert-message': { py: 0 }
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {showSuccess && !error && (
            <Fade in={true}>
              <Alert 
                icon={<CheckCircleOutline fontSize="small" />}
                severity="success" 
                sx={{ 
                  mb: 2,
                  borderRadius: 1,
                  '& .MuiAlert-message': { py: 0 }
                }}
              >
                Pain levels have been marked. You can proceed to submit your assessment.
              </Alert>
            </Fade>
          )}

          <Box sx={{ 
            width: '100%',
            maxWidth: '1200px',
            mx: 'auto',
            height: {xs: '70vh', sm: '80vh', md: '85vh'}, // Increased height for larger model view
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 0,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            >
              {modelType === '3d' ? (
                <ErrorBoundary 
                  onError={handleThreeJsError}
                  key={modelType} // Force remount when model type changes
                >
                  <BodyModel3D
                    onChange={handlePainDataChange}
                    disabled={isLoading}
                    debugMode={debugMode}
                  />
                </ErrorBoundary>
              ) : (
                <SimpleBodyModel 
                  onChange={handlePainDataChange}
                  disabled={isLoading}
                />
              )}
            </Paper>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                Can you describe your pain and how it affects your daily life — including when it started, 
                where it’s located, what makes it better or worse, and what you’re hoping to achieve from treatment?
              </h3>
              <textarea
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                value={painDescription}
                onChange={(e) => setPainDescription(e.target.value)}
                placeholder="Describe your pain experience..."
              />
            </div>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              mt: 2,
              pt: 2,
              borderTop: 1, 
              borderColor: 'divider' 
            }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => navigate('/')}
                  startIcon={<ArrowBack />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Back to Home
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/user-dashboard')}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  User Dashboard
                </Button>
              </Box>
              <Button
                variant="contained"
                size="medium"
                onClick={handleSubmit}
                disabled={isLoading || !painData || Object.keys(painData || {}).length === 0}
                endIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <ArrowForward />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #1a365d 30%, #2b6cb0 90%)',
                  boxShadow: '0 2px 4px rgba(33, 203, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #15294d 30%, #245d9f 90%)'
                  },
                  '&.Mui-disabled': {
                    background: theme.palette.action.disabledBackground
                  }
                }}
              >
                Complete Assessment
              </Button>
            </Box>
          </Box>
        </StyledPaper>
      </Container>
      
      {/* THREE.js Error Dialog */}
      <Dialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        aria-labelledby="threejs-error-dialog-title"
      >
        <DialogTitle id="threejs-error-dialog-title" sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Warning color="error" />
          3D Rendering Issue Detected
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            There was an issue with the 3D model rendering. You have a few options:
          </DialogContentText>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
            <Typography variant="body2" fontFamily="monospace" whiteSpace="pre-wrap">
              {threeJsError ? threeJsError.toString() : 'Unknown THREE.js error'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setShowErrorDialog(false)} color="primary">
            Dismiss
          </Button>
          <Box>
            <Button onClick={resetThreeJsError} startIcon={<RestartAlt />} variant="contained" color="primary" sx={{ mr: 1 }}>
              Reset & Try Again
            </Button>
            <Button onClick={() => {
              setModelType('simple');
              setShowErrorDialog(false);
            }} color="warning">
              Use Simple Model
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PainAssessment;
