import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  // styled, // Removed unused import
  // useTheme, // Removed unused import
  Grid,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowBack, CheckCircle, Print } from '@mui/icons-material';
import api from '../utils/axios';

// Removed StyledPaper and SummarySection, applying styles directly via sx prop

const SummaryPage = () => {
  // const theme = useTheme(); // Keep theme if needed for specific palette access
  const location = useLocation();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const assessmentId = location.state?.assessmentId || localStorage.getItem('assessmentId');
        if (!assessmentId) {
          setError('No assessment ID found. Please start a new assessment.');
          setLoading(false);
          return;
        }

        const response = await api.get(`/assessment/${assessmentId}`);
        setAssessment(response.data);
      } catch (err) {
        console.error('Error fetching assessment:', err);
        setError('Failed to load assessment data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [location.state]);

  const handlePrint = () => {
    window.print();
  };

  const handleStartNew = () => {
    // Clear assessment data from localStorage
    localStorage.removeItem('assessmentId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    // Navigate to intro page (or home page)
    navigate('/');
  };

  if (loading) {
    return (
      // Loading state adjusted for dark theme
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh' // Adjusted height within Layout
      }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    return (
      // Error state adjusted for dark theme
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert
          severity="error"
          variant="filled" // Use filled for better contrast
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/')}>
              Start New Assessment
            </Button>
          }
          sx={{ width: '100%', maxWidth: '600px' }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    // Container adjusted to work within Layout
    <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 4 }}>
        {/* Main Paper adjusted for dark theme */}
        <Paper elevation={6} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, flexGrow: 1, backgroundColor: 'rgba(20, 25, 35, 0.8)', backdropFilter: 'blur(8px)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <CheckCircle sx={{ mr: 2, fontSize: 40, color: 'success.light' }} /> {/* Adjusted icon color */}
            <Typography variant="h3" sx={{ fontWeight: 700 }}> {/* Removed gradient text */}
              Assessment Complete
            </Typography>
          </Box>

          {assessment && (
            <>
              {/* SummarySection styled directly */}
              <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(30, 40, 55, 0.9)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.23)' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Patient Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Name</Typography>
                    <Typography variant="body1">{assessment.userName || assessment.userInfo?.name || 'N/A'}</Typography> {/* Added fallback */}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Email</Typography>
                    <Typography variant="body1">{assessment.userEmail || assessment.userInfo?.email || 'N/A'}</Typography> {/* Added fallback */}
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Assessment Date</Typography>
                    <Typography variant="body1">
                      {assessment.timestamp ? new Date(assessment.timestamp).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* SummarySection styled directly */}
              {assessment.treatmentHistory && Object.keys(assessment.treatmentHistory).length > 0 && (
                <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(30, 40, 55, 0.9)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.23)' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Treatment History</Typography>
                  <Grid container spacing={2}>
                    {Object.entries(assessment.treatmentHistory).map(([key, value]) => (
                      <Grid item xs={12} sm={6} key={key}>
                        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </Typography>
                        <Typography variant="body1">{value || 'N/A'}</Typography> {/* Added fallback */}
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* SummarySection styled directly */}
              {assessment.painLevels && Object.keys(assessment.painLevels).length > 0 && (
                <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(30, 40, 55, 0.9)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.23)' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Pain Assessment</Typography>
                  <Grid container spacing={2}>
                    {Object.entries(assessment.painLevels).map(([location, level]) => (
                      <Grid item xs={12} sm={6} md={4} key={location}>
                        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {location.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()} {/* Improved formatting */}
                        </Typography>
                        <Typography variant="body1">Pain Level: {level}/10</Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.23)' }} /> {/* Styled Divider */}

              {/* Buttons styled */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}> {/* Allow wrapping */}
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/dashboard', { state: { assessmentId: location.state?.assessmentId || localStorage.getItem('assessmentId') } })} // Ensure ID is passed
                    sx={{ borderRadius: 2, px: 4, py: 1.5, textTransform: 'none', fontWeight: 600, color: '#bb86fc', borderColor: 'rgba(187, 134, 252, 0.5)', '&:hover': { borderColor: '#bb86fc', backgroundColor: 'rgba(187, 134, 252, 0.1)' } }}
                  >
                    Back to Dashboard
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => navigate('/user-dashboard')}
                    sx={{ borderRadius: 2, px: 4, py: 1.5, textTransform: 'none', fontWeight: 600, color: '#bb86fc', borderColor: 'rgba(187, 134, 252, 0.5)', '&:hover': { borderColor: '#bb86fc', backgroundColor: 'rgba(187, 134, 252, 0.1)' } }}
                  >
                    Go to User Dashboard
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}> {/* Allow wrapping */}
                  <Button
                    variant="outlined"
                    startIcon={<Print />}
                    onClick={handlePrint}
                    sx={{ borderRadius: 2, px: 4, py: 1.5, textTransform: 'none', fontWeight: 600, color: '#bb86fc', borderColor: 'rgba(187, 134, 252, 0.5)', '&:hover': { borderColor: '#bb86fc', backgroundColor: 'rgba(187, 134, 252, 0.1)' } }}
                  >
                    Print Summary
                  </Button>
                  {/* Start New button styled like HomePage */}
                  <Button
                    variant="contained"
                    onClick={handleStartNew}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
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
            </>
          )}
        </Paper> {/* Close main Paper */}
      </Container>
  );
};

export default SummaryPage;
