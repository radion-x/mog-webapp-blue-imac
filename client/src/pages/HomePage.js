import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      p: 3,
      textAlign: 'center'
    }}>
      <Typography variant="h3" gutterBottom>
        Welcome to the MOG App
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Your journey to understanding and managing pain starts here.
      </Typography>
      <Button
        variant="contained"
        component={Link}
        to="/intro" // Link to the original intro page, now at /intro
        sx={{ mt: 4, px: 5, py: 1.5 }}
      >
        Start Assessment
      </Button>
    </Box>
  );
}

export default HomePage;
