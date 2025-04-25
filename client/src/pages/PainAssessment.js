import React, { useState, useEffect, useRef } from 'react';
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
  // styled, // Removed unused import
  useTheme,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Tooltip,
  IconButton,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  RadioGroup,
  Radio,
  TextField,
  Grid // Added Grid import
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Help,
  CheckCircleOutline,
  RestartAlt,
  Warning,
  BugReport as BugReportIcon,
  TouchApp as TouchAppIcon,
  ArrowUpward,
  ArrowDownward,
  ArrowBackIosNew,
  ArrowForwardIos
} from '@mui/icons-material';

// Import THREE patching early to ensure it's available
import { testThreeJs } from '../utils/threeTest';

// Test if THREE.js is working - run the test immediately
let threeJsWorking = false;
try {
  console.log('Testing THREE.js functionality...');
  threeJsWorking = testThreeJs();
  console.log('THREE.js test result:', threeJsWorking ? 'SUCCESS' : 'FAILED');
} catch (error) {
  console.error('THREE.js initialization test error:', error);
}

const steps = ['Treatment History', 'Pain Assessment', 'Summary'];

const PainAssessment = () => {
  const theme = useTheme(); // Keep theme for potential use later
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [painData, setPainData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [modelType, setModelType] = useState('3d'); // '3d', 'simple'
  const [debugMode, setDebugMode] = useState(false);
  const [threeJsError, setThreeJsError] = useState(null);
  const [painDescription, setPainDescription] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const modelRef = useRef();

  const handleThreeJsError = (error) => {
    console.error('THREE.js error detected:', error);
    setThreeJsError(error);
    setShowErrorDialog(true);
    if (error.toString().includes('WebGL') || error.toString().includes('THREE')) {
      setModelType('simple');
    }
  };

  const resetThreeJsError = () => {
    console.log('Resetting THREE.js error state');
    localStorage.removeItem('three_js_error');
    setThreeJsError(null);
    setModelType('3d');
    setShowErrorDialog(false);
    if (window.location.hash === '#force-reload') {
      window.location.reload();
    } else {
      window.location.hash = 'force-reload';
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const idFromQuery = queryParams.get('id');
    const idFromState = location.state?.assessmentId;
    const idFromStorage = localStorage.getItem('assessmentId');

    console.log('Pain Assessment - ID sources:', { query: idFromQuery, state: idFromState, storage: idFromStorage });

    if (!idFromQuery && !idFromState && !idFromStorage) {
      console.log('No assessment ID found. Creating a temporary one...');
      const createTemporaryAssessment = async () => {
        try {
          setIsLoading(true);
          const response = await api.post('/assessment', { name: 'Temporary User', email: 'temp@example.com' });
          console.log('Temporary assessment created:', response.data);
          if (response.data && response.data._id) {
            const newAssessmentId = response.data._id;
            localStorage.setItem('assessmentId', newAssessmentId);
            localStorage.setItem('userName', 'Temporary User');
            localStorage.setItem('userEmail', 'temp@example.com');
            try {
              const knownAssessmentIds = JSON.parse(localStorage.getItem('knownAssessmentIds') || '[]');
              if (!knownAssessmentIds.includes(newAssessmentId)) {
                knownAssessmentIds.push(newAssessmentId);
                localStorage.setItem('knownAssessmentIds', JSON.stringify(knownAssessmentIds));
                console.log('Added new assessment to known IDs registry:', newAssessmentId);
              }
            } catch (e) { console.error('Error updating known assessment IDs:', e); }
            window.history.replaceState({}, document.title, `/assessment?id=${response.data._id}`);
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
      const assessmentId = idFromQuery || idFromState || idFromStorage;
      console.log('Using assessment ID:', assessmentId);
      localStorage.setItem('assessmentId', assessmentId);
      try {
        const knownAssessmentIds = JSON.parse(localStorage.getItem('knownAssessmentIds') || '[]');
        if (assessmentId && !knownAssessmentIds.includes(assessmentId)) {
          knownAssessmentIds.push(assessmentId);
          localStorage.setItem('knownAssessmentIds', JSON.stringify(knownAssessmentIds));
          console.log('Added existing assessment to known IDs registry:', assessmentId);
        }
      } catch (e) { console.error('Error updating known assessment IDs:', e); }
      const fetchAssessmentData = async () => {
        try {
          const response = await api.get(`/assessment/${assessmentId}`);
          if (response.data && response.data.userInfo) {
            localStorage.setItem('userName', response.data.userInfo.name);
            localStorage.setItem('userEmail', response.data.userInfo.email);
            console.log('User info updated from assessment data');
          }
        } catch (error) { console.error('Error fetching assessment data:', error); }
      };
      fetchAssessmentData();
    }

    const handleError = (event) => {
      const errorMsg = event.error?.message || event.message || '';
      if (errorMsg.includes('BugReportIcon is not defined')) {
        console.error('BugReportIcon error detected - this is a component import issue');
        return;
      }
      if (errorMsg.includes('primaries') || errorMsg.includes('three') || errorMsg.includes('THREE') || errorMsg.includes('WebGL')) {
        handleThreeJsError(event.error || new Error(errorMsg));
      }
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const handlePainDataChange = (data) => {
    console.log('Pain data changed:', data);
    setPainData(data);
    setError('');
    const hasValidPainPoints = Object.values(data || {}).some(painLevel => painLevel > 0);
    setShowSuccess(hasValidPainPoints);
  };

  const toggleDebugMode = () => setDebugMode(prevMode => !prevMode);

  const handleSubmit = async () => {
    const hasValidPainPoints = painData && Object.values(painData).some(painLevel => painLevel > 0);
    if (!hasValidPainPoints) {
      setError('Please mark at least one pain point with a pain level before proceeding');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const assessmentId = localStorage.getItem('assessmentId');
      if (!assessmentId) {
        setError('No assessment ID found. Please try starting again with a new assessment.');
        setIsLoading(false);
        return;
      }
      console.log('Submitting assessment with ID:', assessmentId);
      const assessmentData = {
        userId: assessmentId, // This might be overwritten by backend if linked
        painLevels: painData,
        painDescription: painDescription,
        timestamp: new Date().toISOString()
      };
      console.log('Submitting assessment data:', assessmentData);
      try {
        const token = localStorage.getItem('token');
        if (token && localStorage.getItem('userId')) {
          await api.put(`/assessment/${assessmentId}/link-user`, { userId: localStorage.getItem('userId') });
          console.log('Linked assessment to authenticated user account');
        }
        const response = await api.post('/assessment/pain-assessment', assessmentData);
        console.log('Assessment saved successfully:', response.data);
        localStorage.setItem('assessmentId', assessmentId); // Re-affirm ID
        try {
          const realAssessments = JSON.parse(localStorage.getItem('realAssessments') || '[]');
          const assessmentToSave = { ...response.data, _id: assessmentId, timestamp: assessmentData.timestamp, painLevels: painData, userInfo: { name: localStorage.getItem('userName') || 'User', email: localStorage.getItem('userEmail') || 'user@example.com' }, isRealData: true, isTempData: false };
          const filteredAssessments = realAssessments.filter(a => a._id !== assessmentId);
          filteredAssessments.push(assessmentToSave);
          localStorage.setItem('realAssessments', JSON.stringify(filteredAssessments));
          console.log('Saved assessment to localStorage for dashboard access:', assessmentId);
          const knownIds = JSON.parse(localStorage.getItem('knownAssessmentIds') || '[]');
          if (!knownIds.includes(assessmentId)) {
            knownIds.push(assessmentId);
            localStorage.setItem('knownAssessmentIds', JSON.stringify(knownIds));
            console.log('Updated knownAssessmentIds to include:', assessmentId);
          }
        } catch (e) { console.error('Error saving assessment to localStorage:', e); }
        setIsLoading(false);
        console.log('Navigating to dashboard...');
        window.location.href = `/dashboard?id=${assessmentId}`;
      } catch (apiError) {
        console.error('API Error:', apiError);
        const errorMessage = apiError.response?.data?.message || apiError.response?.data?.error || 'Failed to save pain assessment. Please try again.';
        setError(`API Error: ${errorMessage}`);
        setIsLoading(false);
        localStorage.setItem('assessmentId', assessmentId); // Re-affirm ID even on error
        try {
          const realAssessments = JSON.parse(localStorage.getItem('realAssessments') || '[]');
          const assessmentToSave = { _id: assessmentId, timestamp: new Date().toISOString(), painLevels: painData, userInfo: { name: localStorage.getItem('userName') || 'User', email: localStorage.getItem('userEmail') || 'user@example.com' }, isRealData: true, hasError: true };
          if (!realAssessments.some(a => a._id === assessmentId)) {
            realAssessments.push(assessmentToSave);
            localStorage.setItem('realAssessments', JSON.stringify(realAssessments));
            console.log('Saved error assessment to localStorage for dashboard access:', assessmentId);
          }
        } catch (e) { console.error('Error saving assessment to localStorage:', e); }
        try {
          if (localStorage.getItem('token') && localStorage.getItem('userId')) {
            await api.put(`/assessment/${assessmentId}/link-user`, { userId: localStorage.getItem('userId') });
            console.log('Successfully linked assessment to user before redirecting (error path)');
          }
        } catch (linkErr) { console.error('Error linking assessment before redirect (error path):', linkErr); }
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
    <React.Fragment>
      {/* Container adjusted to work within Layout */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 4 }}>
          {/* Main Paper adjusted for dark theme */}
          <Paper elevation={6} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(20, 25, 35, 0.8)', backdropFilter: 'blur(8px)', color: 'white' }}>
            {/* Stepper styled for dark theme */}
            <Box sx={{ mb: 3 }}>
              <Stepper activeStep={1} alternativeLabel sx={{ '& .MuiStepLabel-label': { color: 'rgba(255, 255, 255, 0.7)', '&.Mui-active': { color: 'white', fontWeight: 'bold' }, '&.Mui-completed': { color: '#bb86fc' } }, '& .MuiStepIcon-root': { color: 'rgba(255, 255, 255, 0.3)', '&.Mui-active': { color: '#bb86fc' }, '&.Mui-completed': { color: '#bb86fc' } } }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Header section */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}> {/* Title color handled by Paper */}
                  Pain Assessment
                </Typography>
                <Tooltip title="Click on the highlighted points on the model to mark your pain levels.">
                  <IconButton size="small" sx={{ ml: 1, color: 'rgba(255, 255, 255, 0.7)' }}> {/* Icon color */}
                    <Help fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Toggle debug mode">
                  <IconButton
                    onClick={toggleDebugMode}
                    sx={{ mr: 1, color: debugMode ? '#f48fb1' : 'rgba(255, 255, 255, 0.7)' }} // Error color for debug on
                  >
                    <BugReportIcon />
                  </IconButton>
                </Tooltip>

                {/* RadioGroup styled for dark theme */}
                <Tooltip title="Select visualization type">
                  <RadioGroup
                    row
                    aria-label="visualization-type"
                    name="visualization-type"
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    sx={{ '& .MuiFormControlLabel-label': { color: 'rgba(255, 255, 255, 0.7)' }, '& .MuiRadio-root': { color: 'rgba(255, 255, 255, 0.7)', '&.Mui-checked': { color: '#bb86fc' } } }}
                  >
                    <FormControlLabel value="3d" control={<Radio size="small" />} label="3D" />
                    <FormControlLabel value="simple" control={<Radio size="small" />} label="Simple" />
                  </RadioGroup>
                </Tooltip>
              </Box>
            </Box>

            {/* Alerts styled for dark theme */}
            {error && (
              <Fade in={true}>
                <Alert severity="error" variant="filled" sx={{ mb: 2, '.MuiAlert-message': { color: 'rgba(0, 0, 0, 0.87)' } }}>
                  {error}
                </Alert>
              </Fade>
            )}

            {showSuccess && !error && (
              <Fade in={true}>
                <Alert icon={<CheckCircleOutline fontSize="small" />} severity="success" variant="filled" sx={{ mb: 2, '.MuiAlert-message': { color: 'rgba(0, 0, 0, 0.87)' } }}>
                  Pain levels have been marked. You can proceed to submit your assessment.
                </Alert>
              </Fade>
            )}
            {/* Corrected: Removed extra closing parentheses */}

            {/* Use Grid for Model and Description layout */}
            {/* Ensure the Grid container itself can grow and items stretch */}
            <Grid container spacing={3} sx={{ flexGrow: 1, mt: 1, alignItems: 'stretch' }}>

              {/* Model Area in Grid Item */}
              {/* Removed minHeight, rely on flexbox */}
              <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column' }}>
                {/* Instructional Text styled */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                  <TouchAppIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} />
                  <Typography variant="caption">
                    Click, hold, and drag to rotate the model. Use scroll to zoom.
                  </Typography>
                </Box>

                {/* Model container Paper styled */}
                <Paper
                  elevation={4}
                  sx={{
                    flexGrow: 1, // Allow paper to grow vertically
                    position: 'relative',
                    p: 0,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                    width: '100%',
                      height: '100%', // Make paper fill the grid item height
                      overflow: 'hidden',
                      display: 'flex', // Use flex to make canvas fill space
                      flexDirection: 'column',
                      backgroundColor: 'rgba(10, 15, 25, 0.7)',
                      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)'
                    }}
                  >
                    {/* Camera Control Buttons styled */}
                  <Box sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Tooltip title="View Front">
                      <IconButton size="small" sx={{ bgcolor: 'rgba(40, 50, 70, 0.8)', color: 'white', '&:hover': { bgcolor: 'rgba(50, 60, 80, 1)' }, borderRadius: 1 }} onClick={() => modelRef.current?.setViewFront()}>
                        <ArrowDownward fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Back">
                      <IconButton size="small" sx={{ bgcolor: 'rgba(40, 50, 70, 0.8)', color: 'white', '&:hover': { bgcolor: 'rgba(50, 60, 80, 1)' }, borderRadius: 1 }} onClick={() => modelRef.current?.setViewBack()}>
                        <ArrowUpward fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Left">
                      <IconButton size="small" sx={{ bgcolor: 'rgba(40, 50, 70, 0.8)', color: 'white', '&:hover': { bgcolor: 'rgba(50, 60, 80, 1)' }, borderRadius: 1 }} onClick={() => modelRef.current?.setViewLeft()}>
                        <ArrowBackIosNew fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Right">
                      <IconButton size="small" sx={{ bgcolor: 'rgba(40, 50, 70, 0.8)', color: 'white', '&:hover': { bgcolor: 'rgba(50, 60, 80, 1)' }, borderRadius: 1 }} onClick={() => modelRef.current?.setViewRight()}>
                        <ArrowForwardIos fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  {modelType === '3d' ? (
                    <ErrorBoundary
                      onError={handleThreeJsError}
                      key={modelType}
                    >
                      <BodyModel3D
                        ref={modelRef}
                        onChange={handlePainDataChange}
                        disabled={isLoading}
                        debugMode={debugMode}
                        // Add style to ensure it fills container
                        style={{ width: '100%', height: '100%' }}
                      />
                    </ErrorBoundary>
                  ) : (
                    <SimpleBodyModel
                      onChange={handlePainDataChange}
                      disabled={isLoading}
                      // Add style to ensure it fills container
                      style={{ width: '100%', height: '100%' }}
                    />
                  )}
                </Paper> {/* Close Model Paper */}
            </Grid> {/* Close Model Grid Item */}

            {/* Description and Actions in Grid Item */}
            {/* Ensure this Grid item also uses flex column */}
            <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column' }}>
              {/* Pain Description Input styled */}
              {/* Let description box grow, but not excessively */}
              <Box sx={{ mb: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Describe Your Pain Experience
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Please describe your pain and how it affects your daily life — including when it started, where it’s located, what makes it better or worse, and what you’re hoping to achieve from treatment.
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={10} // Adjusted rows slightly
                  variant="filled"
                  label="Pain Description"
                  value={painDescription}
                  onChange={(e) => setPainDescription(e.target.value)}
                  placeholder="Enter details here..."
                  sx={{
                    flexGrow: 1, // Allow TextField to grow
                    '& .MuiFilledInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      height: '100%', // Make input fill the available space
                      alignItems: 'flex-start' // Align text to top
                    },
                    '& .MuiInputBase-inputMultiline': {
                      height: '100% !important', // Override default height if needed
                      overflow: 'auto !important' // Ensure scrollability
                    },
                    textarea: { color: 'white' },
                    label: { color: 'rgba(255, 255, 255, 0.7)' }
                  }}
                />
              </Box>

              {/* Action Buttons styled - Placed at the bottom */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto', pt: 2, borderTop: 1, borderColor: 'rgba(255, 255, 255, 0.23)' }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {/* Back button - Styled like HomePage */}
                  <Button
                    variant="contained" // Changed to contained
                    size="medium"
                    onClick={() => navigate('/')}
                    startIcon={<ArrowBack />}
                    sx={{
                      borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 600,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#1a1a2e',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)', transform: 'scale(1.03)', boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)' },
                      transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    }}
                  >
                    Back to Home
                  </Button>

                  {/* Dashboard button - Styled like HomePage */}
                  <Button
                    variant="contained" // Changed to contained
                    onClick={() => navigate('/user-dashboard')}
                    sx={{
                      borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 600,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#1a1a2e',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)', transform: 'scale(1.03)', boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)' },
                      transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    }}
                  >
                    User Dashboard
                  </Button>
                </Box>
                {/* Complete button - Styled like HomePage (already correct) */}
                <Button
                  variant="contained"
                  size="medium"
                    onClick={handleSubmit}
                    disabled={isLoading || !painData || Object.keys(painData || {}).length === 0}
                    endIcon={isLoading ? <CircularProgress size={16} sx={{ color: '#1a1a2e' }} /> : <ArrowForward />}
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
                      '&.Mui-disabled': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Lighter disabled background
                        color: 'rgba(0, 0, 0, 0.4)'
                      }
                    }}
                  >
                    Complete Assessment
                  </Button>
                </Box>
              </Grid> {/* Close Description Grid Item */}
            </Grid> {/* Close main Grid container */}
          </Paper> {/* Close main Paper */}
        </Container>

        {/* THREE.js Error Dialog styled */}
        <Dialog
          open={showErrorDialog}
          onClose={() => setShowErrorDialog(false)}
          aria-labelledby="threejs-error-dialog-title"
          PaperProps={{ sx: { backgroundColor: '#1f2a3e', color: 'white' } }} // Dark background
        >
          <DialogTitle id="threejs-error-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
            <Warning color="error" />
            3D Rendering Issue Detected
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              There was an issue with the 3D model rendering. You have a few options:
            </DialogContentText>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(244, 143, 177, 0.1)', color: '#f48fb1', borderRadius: 1, border: '1px solid rgba(244, 143, 177, 0.3)' }}>
              <Typography variant="body2" fontFamily="monospace" whiteSpace="pre-wrap">
                {threeJsError ? threeJsError.toString() : 'Unknown THREE.js error'}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setShowErrorDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Dismiss
            </Button>
            <Box>
              <Button onClick={resetThreeJsError} startIcon={<RestartAlt />} variant="contained" sx={{ mr: 1, backgroundColor: '#bb86fc', '&:hover': { backgroundColor: '#a16ae8' } }}>
                Reset & Try Again
              </Button>
              <Button onClick={() => { setModelType('simple'); setShowErrorDialog(false); }} sx={{ color: '#f48fb1' }}>
                Use Simple Model
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
    </React.Fragment> // Close the fragment
  );
};

export default PainAssessment;
