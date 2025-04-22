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
  Grid
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}));

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
      bgcolor: 'grey.50',
      py: 4,
      backgroundImage: 'linear-gradient(to bottom right, #f7fafc, #edf2f7)'
    }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Pain Assessment Tool
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Register to start your pain assessment
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Button
              variant="outlined"
              component={Link}
              to="/login"
              sx={{ mr: 2 }}
            >
              Already have an account? Login
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Register & Start Assessment
            </Typography>
          </Divider>

          {apiError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: 2,
                boxShadow: theme.shadows[2]
              }}
            >
              {apiError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
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
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
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
              sx={{ mb: 3 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
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
              size="large"
              fullWidth
              disabled={isLoading}
              endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
              sx={{
                mt: 4,
                borderRadius: 2,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1a365d 30%, #2b6cb0 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #15294d 30%, #245d9f 90%)'
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