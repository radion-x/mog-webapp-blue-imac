import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  styled,
  useTheme,
  CircularProgress,
  Divider,
  Grid,
  Avatar
} from '@mui/material';
import { ArrowForward, LocalHospital } from '@mui/icons-material';

// Removed unused StyledPaper definition here, applying styles directly or via sx prop

const IntroPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear API error when user makes changes
    if (apiError) {
      setApiError('');
    }
  };

  const validate = () => {
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    setApiError('');
    
    try {
      // 1. First register the user
      const { name, email, password } = formData;
      console.log('Registering user with email:', email);
      const registerResponse = await api.post('/auth/register', { name, email, password });
      
      console.log('Registration successful!');
      
      if (registerResponse.data.token) {
        console.log('Token received, logging in...');
        
        // 2. Login with the token
        const success = await login(registerResponse.data.token);
        if (success) {
          console.log('Login successful, saving user ID...');
          localStorage.setItem('userId', registerResponse.data.user.id);
          
          // Show success message
          setIsLoading(false);
          
          // Create a temporary success element
          const successElement = document.createElement('div');
          successElement.style.position = 'fixed';
          successElement.style.top = '20px';
          successElement.style.left = '50%';
          successElement.style.transform = 'translateX(-50%)';
          successElement.style.backgroundColor = '#4caf50';
          successElement.style.color = 'white';
          successElement.style.padding = '15px 20px';
          successElement.style.borderRadius = '4px';
          successElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
          successElement.style.zIndex = '9999';
          successElement.style.fontSize = '16px';
          successElement.style.fontWeight = 'bold';
          successElement.innerHTML = 'Account created successfully! Redirecting to assessment...';
          document.body.appendChild(successElement);
          
          // Set a timeout to redirect after showing the message
          setTimeout(async () => {
            try {
              // 3. Create a basic assessment
              console.log('Creating assessment for registered user...');
              
              const assessmentResponse = await api.post('/assessment', {
                name: formData.name,
                email: formData.email
              });
              
              console.log('Assessment created:', assessmentResponse.data);
              
              if (assessmentResponse.data) {
                // Store assessment info in localStorage
                localStorage.setItem('assessmentId', assessmentResponse.data._id);
                
                try {
                  // 4. Link the assessment to the user account
                  console.log('Linking assessment to user account...');
                  await api.put(`/assessment/${assessmentResponse.data._id}/link-user`, {
                    userId: registerResponse.data.user.id
                  });
                  console.log('Assessment linked successfully');
                } catch (linkError) {
                  console.error('Error linking assessment to user:', linkError);
                  // Continue even if linking fails
                }
                
                // Remove success message
                document.body.removeChild(successElement);
                
                // Hard redirect directly to pain assessment page with 3D model
                console.log('Redirecting directly to pain assessment page...');
                window.location.href = `/assessment?id=${assessmentResponse.data._id}`;
              }
            } catch (error) {
              console.error('Error in assessment creation:', error);
              document.body.removeChild(successElement);
              setApiError('Failed to create assessment. Please try again.');
              setIsLoading(false);
            }
          }, 2000); // Show message for 2 seconds before redirecting
        } else {
          setApiError('Registration was successful but failed to set user session');
        }
      } else {
        setApiError('Registration successful but no token received');
      }
    } catch (error) {
      console.error('Error:', error);
      
      if (error.response) {
        console.error('Server response:', error.response.data);
        
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          // Handle validation errors from server
          const serverErrors = error.response.data.errors.reduce((acc, err) => {
            acc[err.param] = err.msg;
            return acc;
          }, {});
          setErrors(serverErrors);
          setApiError('Please correct the errors in the form');
        } else if (error.response.data.msg) {
          setApiError(error.response.data.msg);
        } else {
          setApiError(`Server error: ${error.response.status}`);
        }
      } else if (error.message) {
        setApiError(`Failed to process: ${error.message}`);
      } else {
        setApiError('Failed to process. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      py: 6, // Increased padding
      background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`, // Enhanced gradient
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Container maxWidth="sm"> {/* Changed to sm for a potentially narrower form */}
        <Paper elevation={6} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(5px)' }}> {/* Increased padding, rounded corners, slight transparency */}
          <Box sx={{ textAlign: 'center', mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56, mb: 2 }}> {/* Added Icon Avatar */}
              <LocalHospital fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Pain Assessment Tool
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Register below to begin your personalized assessment.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Button
              variant="text" // Changed to text for less emphasis
              component={Link}
              to="/login"
              sx={{ mr: 2, textTransform: 'none' }} // Added textTransform
            >
              Already have an account? Login
            </Button>
          </Box>

          {/* Removed Divider for a cleaner look */}

          {apiError && (
            <Alert
              severity="error"
              sx={{
                mb: 3, // Adjusted margin
                borderRadius: 1, // Slightly less rounded
              }}
            >
              {apiError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate> {/* Added noValidate */}
            <TextField
              fullWidth
              variant="filled" // Changed variant
              label="Full Name"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={isLoading}
              required
              autoComplete="name"
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2 }} // Reduced margin
            />

            <TextField
              fullWidth
              variant="filled" // Changed variant
              label="Email Address"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isLoading}
              required
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email}
              sx={{ mb: 2 }} // Reduced margin
            />

            <Grid container spacing={2} sx={{ mb: 2 }}> {/* Reduced bottom margin */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="filled" // Changed variant
                  label="Password"
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
                  error={!!errors.password}
                  helperText={errors.password || "Minimum 6 characters"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="filled" // Changed variant
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              color="primary" // Use theme primary color
              size="large"
              fullWidth
              disabled={isLoading}
              endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
              sx={{
                mt: 3, // Adjusted margin
                borderRadius: 50, // Pill shape
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold', // Bolder text
                fontSize: '1rem',
                // Removed custom gradient, rely on theme
                boxShadow: theme.shadows[3],
                '&:hover': {
                  boxShadow: theme.shadows[6],
                  // Slightly darker on hover if needed, theme might handle this
                  // backgroundColor: theme.palette.primary.dark 
                }
              }}
            >
              {isLoading ? 'Processing...' : 'Register & Start Assessment'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default IntroPage;
