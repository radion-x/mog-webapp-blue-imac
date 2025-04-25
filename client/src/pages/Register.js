import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Grid,
  Snackbar
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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
    
    setLoading(true);
    setApiError('');
    
    try {
      const { name, email, password } = formData;
      console.log('Sending registration request with email:', email);
      const response = await api.post('/auth/register', { name, email, password });
      
      console.log('Registration successful!');
      
      if (response.data.token) {
        console.log('Token received, logging in...');
        setSnackbarMessage('Registration successful!');
        setSnackbarOpen(true);
        
        const success = await login(response.data.token);
        if (success) {
          console.log('Login successful, saving user ID and redirecting...');
          localStorage.setItem('userId', response.data.user.id);
          navigate('/user-dashboard');
        } else {
          setApiError('Registration was successful but failed to set user session');
        }
      } else {
        setApiError('Registration successful but no token received');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
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
        setApiError(`Failed to register: ${error.message}`);
      } else {
        setApiError('Failed to register. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    // Container adjusted to center content within the Layout
    <Container component="main" maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, py: 4 }}>
      {/* Paper adjusted for dark theme */}
      <Paper
        elevation={6} // Increased elevation
        sx={{
          p: { xs: 3, sm: 4 }, // Adjusted padding
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 3, // Match other forms
          backgroundColor: 'rgba(20, 25, 35, 0.8)', // Dark, semi-transparent background
          backdropFilter: 'blur(8px)', // Match other forms
          width: '100%',
          color: 'white' // Default text color
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}> {/* Bolder title */}
          Create Your Account
        </Typography>
        
        {apiError && (
          <Alert severity="error" variant="filled" sx={{ width: '100%', mb: 3, '.MuiAlert-message': { color: 'rgba(0, 0, 0, 0.87)' } }}> {/* Filled alert */}
            {apiError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          {/* TextField styles updated for dark mode */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            disabled={loading}
            variant="filled" // Use filled variant
            sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, '.MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' } }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email || "Use a valid email format (e.g., name@example.com)"}
            disabled={loading}
            variant="filled" // Use filled variant
            sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, '.MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' } }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password || "Minimum 6 characters"}
                disabled={loading}
                variant="filled" // Use filled variant
                sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, '.MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                disabled={loading}
                variant="filled" // Use filled variant
                sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, '.MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' } }}
              />
            </Grid>
          </Grid>
          
          {/* Button style updated to match HomePage/IntroPage/Login */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large" // Match other forms
            sx={{
              mt: 3,
              mb: 2,
              px: 5, // Match padding
              py: 1.5,
              fontSize: '1rem', // Match font size
              backgroundColor: 'rgba(255, 255, 255, 0.95)', // Match background
              color: '#1a1a2e', // Match text color
              fontWeight: 'bold',
              borderRadius: 2, // Standard shape
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.03)',
                boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
              },
              transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#1a1a2e' }} /> : 'Register'} {/* Ensure spinner color matches text */}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            {/* Link color updated */}
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none', color: '#bb86fc' }}> {/* Use a lighter, distinct color for links */}
                Login here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Snackbar styling for dark theme */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        ContentProps={{
          sx: {
            backgroundColor: 'success.main', // Use theme success color
            color: 'white', // Ensure text is readable
          }
        }}
      />
    </Container>
  );
};

export default Register;
