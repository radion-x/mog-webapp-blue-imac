import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  styled,
  useTheme,
  Grid,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowBack, CheckCircle, Print } from '@mui/icons-material';
import api from '../utils/axios';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}));

const SummarySection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`
}));

const SummaryPage = () => {
  const theme = useTheme();
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
    // Navigate to intro page
    navigate('/');
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/')}>
              Start New Assessment
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'grey.50',
      py: 4,
      backgroundImage: 'linear-gradient(to bottom right, #f7fafc, #edf2f7)'
    }}>
      <Container maxWidth="lg">
        <StyledPaper elevation={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <CheckCircle color="success" sx={{ mr: 2, fontSize: 40 }} />
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #1a365d 30%, #2b6cb0 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Assessment Complete
            </Typography>
          </Box>

          {assessment && (
            <>
              <SummarySection>
                <Typography variant="h6" gutterBottom>Patient Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                    <Typography variant="body1">{assessment.userName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                    <Typography variant="body1">{assessment.userEmail}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Assessment Date</Typography>
                    <Typography variant="body1">
                      {new Date(assessment.timestamp).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Grid>
                </Grid>
              </SummarySection>

              <SummarySection>
                <Typography variant="h6" gutterBottom>Treatment History</Typography>
                <Grid container spacing={2}>
                  {assessment.treatmentHistory && Object.entries(assessment.treatmentHistory).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Typography>
                      <Typography variant="body1">{value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </SummarySection>

              <SummarySection>
                <Typography variant="h6" gutterBottom>Pain Assessment</Typography>
                <Grid container spacing={2}>
                  {assessment.painLevels && Object.entries(assessment.painLevels).map(([location, level]) => (
                    <Grid item xs={12} sm={6} md={4} key={location}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {location.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                      <Typography variant="body1">Pain Level: {level}/10</Typography>
                    </Grid>
                  ))}
                </Grid>
              </SummarySection>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/dashboard', { state: { assessmentId: location.state?.assessmentId } })}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Back to Dashboard
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/user-dashboard')}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Go to User Dashboard
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Print />}
                    onClick={handlePrint}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Print Summary
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleStartNew}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #1a365d 30%, #2b6cb0 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #15294d 30%, #245d9f 90%)'
                      }
                    }}
                  >
                    Start New Assessment
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default SummaryPage; 