import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage'; // Root page, already styled
import IntroPage from './pages/IntroPage';
import PainAssessment from './pages/PainAssessment';
import TreatmentHistoryPage from './pages/TreatmentHistoryPage';
import SummaryPage from './pages/SummaryPage';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout'; // Import the Layout component
import { lightTheme, darkTheme } from './theme'; // Import both themes
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

// Create a context for theme management
export const ThemeContext = createContext({
  themeMode: 'light',
  toggleThemeMode: () => {},
});

// Custom hook to use the theme context
export const useThemeContext = () => useContext(ThemeContext);

// Create router configuration (remains the same, Layout will consume context)
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />, // HomePage has its own styling, no Layout needed
  },
  {
    path: '/intro',
    element: <Layout><IntroPage /></Layout>, // Wrap with Layout
  },
  {
    path: '/login',
    element: <Layout><Login /></Layout>, // Wrap with Layout
  },
  {
    path: '/register',
    element: <Layout><Register /></Layout>, // Wrap with Layout
  },
  {
    path: '/user-dashboard',
    element: (
      <ProtectedRoute>
        <Layout><UserDashboard /></Layout> {/* Wrap with Layout */}
      </ProtectedRoute>
    ),
  },
  {
    path: '/assessment',
    element: <Layout><PainAssessment /></Layout>, // Wrap with Layout
  },
  {
    path: '/history',
    element: (
      <ProtectedRoute>
        <Layout><TreatmentHistoryPage /></Layout> {/* Wrap with Layout */}
      </ProtectedRoute>
    ),
  },
  {
    path: '/summary',
    element: (
      <ProtectedRoute>
        <Layout><SummaryPage /></Layout> {/* Wrap with Layout */}
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard', // Consider if this needs protection/layout
    element: <Layout><Dashboard /></Layout>, // Wrap with Layout
  },
  {
    path: '/treatment-history', // Note: Seems redundant with /history
    element: (
      <ProtectedRoute>
        <Layout><TreatmentHistoryPage /></Layout> {/* Wrap with Layout */}
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin-dashboard',
    element: (
      <ProtectedRoute requiredAdmin={true}> {/* Assuming ProtectedRoute handles admin check */}
        <Layout><AdminDashboard /></Layout> {/* Wrap with Layout */}
      </ProtectedRoute>
    ),
  },
  {
    path: '*', // Catch-all for Not Found
    element: (
      <Layout> {/* Wrap Not Found page with Layout */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 1, // Allow Box to grow within Layout
          color: 'white', // Ensure text is visible
          p: 3,
          textAlign: 'center'
        }}>
          <Typography variant="h4" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: 'rgba(255, 255, 255, 0.7)' }}> {/* Adjust secondary text color */}
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/"
            sx={{
              mt: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)', // Style button like HomePage
              color: '#333',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              }
            }}
          >
            Go to Home
          </Button>
        </Box>
      </Layout>
    ),
  },
]);

function App() {
  // State to manage the theme mode ('light' or 'dark')
  const [themeMode, setThemeMode] = useState('dark'); // Default to dark as requested

  // Function to toggle the theme mode
  const toggleThemeMode = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Select the theme object based on the current mode
  const activeTheme = useMemo(
    () => (themeMode === 'light' ? lightTheme : darkTheme),
    [themeMode]
  );

  // Add/remove 'dark-theme' class to body based on themeMode
  useEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme'); // Clear existing theme classes
    document.body.classList.add(themeMode === 'dark' ? 'dark-theme' : 'light-theme');
  }, [themeMode]);

  // Value for the ThemeContext provider
  const themeContextValue = useMemo(
    () => ({ themeMode, toggleThemeMode }),
    [themeMode] // Keep dependency array as is
  );

  return (
    <CacheProvider value={cache}>
      {/* Provide theme mode and toggle function via context */}
      <ThemeContext.Provider value={themeContextValue}>
        {/* Apply the selected MUI theme */}
        <ThemeProvider theme={activeTheme}>
          <CssBaseline /> {/* Keep CssBaseline for base styling */}
          <AuthProvider>
            <AppProvider>
              {/* RouterProvider now lives within the ThemeProvider and ThemeContext */}
              <RouterProvider router={router} />
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </ThemeContext.Provider>
    </CacheProvider>
  );
}

export default App;
