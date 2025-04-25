import { createTheme } from '@mui/material/styles';

// Common typography, shape, shadows, and component overrides
const commonSettings = {
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01562em' },
    h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.00833em' },
    h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.2, letterSpacing: '0em' },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.2, letterSpacing: '0.00735em' },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.2, letterSpacing: '0em' },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.2, letterSpacing: '0.0075em' },
    subtitle1: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5, letterSpacing: '0.00938em' },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.57, letterSpacing: '0.00714em' },
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.00938em' },
    body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43, letterSpacing: '0.01071em' },
    button: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.75, letterSpacing: '0.02857em', textTransform: 'none' },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -1px rgba(0,0,0,0.06)',
    '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -2px rgba(0,0,0,0.05)',
    '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 10px 10px -5px rgba(0,0,0,0.04)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    ...Array(19).fill('none'), // Fill remaining shadows
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -1px rgba(0,0,0,0.06)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#1e40af', // Darker primary for hover
          },
        },
        outlinedPrimary: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -1px rgba(0,0,0,0.06)',
        },
        elevation2: {
          boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -2px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: 16,
          boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -1px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderWidth: 2,
            },
            '&.Mui-focused fieldset': {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 16px',
        },
        // Light theme standard alerts (keep existing)
        standardSuccess: { backgroundColor: '#ecfdf5', color: '#065f46' },
        standardError: { backgroundColor: '#fef2f2', color: '#991b1b' },
        standardWarning: { backgroundColor: '#fffbeb', color: '#92400e' },
        standardInfo: { backgroundColor: '#eff6ff', color: '#1e40af' },
      },
    },
  },
};

// Create light theme instance
export const lightTheme = createTheme({
  ...commonSettings,
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Blue-600
      light: '#60a5fa', // Blue-400
      dark: '#1e40af', // Blue-800
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64748b', // Slate-500
      light: '#94a3b8', // Slate-400
      dark: '#475569', // Slate-600
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Slate-50
      paper: '#ffffff', // White
    },
    error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' }, // Red-500
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' }, // Amber-500
    info: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' }, // Blue-500
    success: { main: '#10b981', light: '#34d399', dark: '#059669' }, // Emerald-500
    grey: {
      50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
      400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
      800: '#1e293b', 900: '#0f172a',
    },
    text: {
      primary: '#1e293b', // Slate-800
      secondary: '#475569', // Slate-600
      disabled: '#94a3b8', // Slate-400
    },
  },
});

// Create dark theme instance
export const darkTheme = createTheme({
  ...commonSettings,
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa', // Blue-400 (Lighter for dark mode contrast)
      light: '#93c5fd', // Blue-300
      dark: '#3b82f6', // Blue-500
      contrastText: '#1e293b', // Dark text for light primary
    },
    secondary: {
      main: '#94a3b8', // Slate-400 (Lighter for dark mode contrast)
      light: '#cbd5e1', // Slate-300
      dark: '#64748b', // Slate-500
      contrastText: '#1e293b', // Dark text for light secondary
    },
    background: {
      default: '#0f172a', // Slate-900
      paper: '#1e293b', // Slate-800
    },
    error: { main: '#f87171', light: '#fca5a5', dark: '#ef4444' }, // Red-400
    warning: { main: '#fbbf24', light: '#fcd34d', dark: '#f59e0b' }, // Amber-400
    info: { main: '#60a5fa', light: '#93c5fd', dark: '#3b82f6' }, // Blue-400
    success: { main: '#34d399', light: '#6ee7b7', dark: '#10b981' }, // Emerald-400
    grey: { // Keep grey scale consistent, but text/bg uses it differently
      50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
      400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
      800: '#1e293b', 900: '#0f172a',
    },
    text: {
      primary: '#f1f5f9', // Slate-100
      secondary: '#cbd5e1', // Slate-300
      disabled: '#64748b', // Slate-500
    },
  },
  components: {
    ...commonSettings.components, // Inherit common component styles
    MuiButton: { // Override specific button styles for dark mode if needed
      ...commonSettings.components.MuiButton,
      styleOverrides: {
        ...commonSettings.components.MuiButton.styleOverrides,
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#3b82f6', // Adjust hover for dark mode primary
          },
        },
      },
    },
    MuiAlert: { // Override alert styles for dark mode
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 16px',
        },
        standardSuccess: { backgroundColor: '#064e3b', color: '#a7f3d0' }, // Darker bg, lighter text
        standardError: { backgroundColor: '#7f1d1d', color: '#fecaca' },
        standardWarning: { backgroundColor: '#78350f', color: '#fed7aa' },
        standardInfo: { backgroundColor: '#1e3a8a', color: '#bfdbfe' },
      },
    },
    MuiPaper: { // Adjust paper elevation for dark mode
        styleOverrides: {
            ...commonSettings.components.MuiPaper.styleOverrides,
            elevation1: {
                boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.3), 0px 2px 4px -1px rgba(0,0,0,0.2)', // Darker shadow
            },
            elevation2: {
                boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.3), 0px 4px 6px -2px rgba(0,0,0,0.2)', // Darker shadow
            },
        }
    },
     MuiCard: { // Adjust card elevation for dark mode
      styleOverrides: {
        ...commonSettings.components.MuiCard.styleOverrides,
        root: {
          ...commonSettings.components.MuiCard.styleOverrides.root,
           boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.3), 0px 2px 4px -1px rgba(0,0,0,0.2)', // Darker shadow
        },
      },
    },
  },
});
