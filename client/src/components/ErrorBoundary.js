import React from 'react';
import { Box, Typography, Button, Paper, Divider, Alert } from '@mui/material';
import SimpleBodyModel from './SimpleBodyModel';
import { Warning, Refresh, BugReport } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showError: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console with detailed information
    console.error('ErrorBoundary caught an error:', {
      error,
      errorInfo,
      componentStack: errorInfo?.componentStack
    });
    
    this.setState({ errorInfo });
    
    // Call the onError callback if provided
    if (typeof this.props.onError === 'function') {
      this.props.onError(error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Force a reload of the component
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Get any props that need to be passed to the fallback component
      const childProps = this.props.children?.props || {};
      
      return (
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          p: 2,
          bgcolor: 'background.default'
        }}>
          <Alert 
            severity="error"
            icon={<Warning />}
            sx={{ mb: 2 }}
            action={
              <Button
                color="error"
                size="small"
                onClick={() => this.setState({ showError: !this.state.showError })}
              >
                {this.state.showError ? 'Hide Details' : 'Show Details'}
              </Button>
            }
          >
            There was an error loading the 3D model
          </Alert>

          {this.state.showError && (
            <Paper 
              sx={{ 
                p: 2, 
                mb: 2, 
                bgcolor: 'error.light',
                color: 'error.contrastText',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                overflow: 'auto',
                maxHeight: '200px'
              }}
            >
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" component="div" sx={{ fontWeight: 'bold' }}>
                  Error: {this.state.error?.toString()}
                </Typography>
              </Box>
              {this.state.errorInfo?.componentStack && (
                <Box sx={{ opacity: 0.8 }}>
                  {this.state.errorInfo.componentStack}
                </Box>
              )}
            </Paper>
          )}

          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Refresh />}
              onClick={this.handleReset}
            >
              Try Again
            </Button>
            {this.props.onError && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<BugReport />}
                onClick={() => this.props.onError(this.state.error)}
              >
                Report Issue
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Fallback View
            </Typography>
          </Divider>

          <Box sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper'
          }}>
            <SimpleBodyModel 
              onChange={childProps.onChange} 
              disabled={childProps.disabled}
            />
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 