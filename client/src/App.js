import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import CssBaseline from '@mui/material/CssBaseline';
import IntroPage from './pages/IntroPage';
import PainAssessment from './pages/PainAssessment';
import TreatmentHistoryPage from './pages/TreatmentHistoryPage';
import SummaryPage from './pages/SummaryPage';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import { theme } from './theme';
import './App.css';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Create the cache with prepend: true and insert point in head
const cache = createCache({
  key: 'mui',
  prepend: true,
  stylisPlugins: [],
});

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <IntroPage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/user-dashboard',
    element: (
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/assessment',
    element: <PainAssessment />,
  },
  {
    path: '/history',
    element: (
      <ProtectedRoute>
        <TreatmentHistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/summary',
    element: (
      <ProtectedRoute>
        <SummaryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/treatment-history',
    element: (
      <ProtectedRoute>
        <TreatmentHistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin-dashboard',
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        p: 3,
        textAlign: 'center'
      }}>
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button 
          variant="contained" 
          component={Link} 
          to="/"
          sx={{ mt: 2 }}
        >
          Go to Home
        </Button>
      </Box>
    ),
  },
]);

function App() {
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AppProvider>
            <RouterProvider router={router} />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
