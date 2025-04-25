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
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      console.log('Sending login request...');
      const response = await api.post('/auth/login', formData);

      console.log('Login response:', response.data);

      if (response.data.token) {
        console.log('Attempting to set token and login...');
        const success = await login(response.data.token);
        if (success) {
          console.log('Login successful, saving user ID and redirecting...');
          localStorage.setItem('userId', response.data.user.id);
          navigate('/user-dashboard');
        } else {
          setApiError('Login was successful but failed to set user session');
        }
      } else {
        setApiError('Login successful but no token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data && error.response.data.msg) {
        setApiError(error.response.data.msg);
      } else if (error.message) {
        setApiError(`Failed to login: ${error.message}`);
      } else {
        setApiError('Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Container adjusted to center content within the Layout
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, py: 4 }}>
      {/* Paper adjusted for dark theme */}
      <Paper
        elevation={6} // Increased elevation for more depth
        sx={{
          p: { xs: 3, sm: 4 }, // Adjusted padding
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 3, // Match IntroPage border radius
          backgroundColor: 'rgba(20, 25, 35, 0.8)', // Dark, semi-transparent background
          backdropFilter: 'blur(8px)', // Match IntroPage blur
          width: '100%',
          color: 'white' // Default text color
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}> {/* Bolder title */}
          Login to Your Account
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
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
            variant="filled" // Use filled variant
            sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, '.MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' } }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            disabled={loading}
            variant="filled" // Use filled variant
            sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, '.MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' } }}
          />

          {/* Button style updated to match HomePage/IntroPage */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large" // Match IntroPage button size
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
            {loading ? <CircularProgress size={24} sx={{ color: '#1a1a2e' }} /> : 'Login'} {/* Ensure spinner color matches text */}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            {/* Link color updated */}
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ textDecoration: 'none', color: '#bb86fc' }}> {/* Use a lighter, distinct color for links */}
                Register here
              </Link>
            </Typography>
          </Box>
          {/* Ensure this Box closes the form Box */}
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
