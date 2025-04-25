import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim"; // Using slim bundle for essential features

function HomePage() {
  const [init, setInit] = useState(false);

  // Initialize tsparticles engine once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // console.log("Initializing particles engine...");
      // Load the slim preset bundle (includes necessary features like links, repulse)
      await loadSlim(engine);
      // console.log("Particles engine loaded.");
    }).then(() => {
      // console.log("Initialization complete.");
      setInit(true); // Mark initialization as complete
    }).catch(error => {
      console.error("Particles engine initialization failed:", error);
    });
  }, []); // Empty dependency array ensures this runs only once on mount

  const particlesLoaded = useCallback(async container => {
    // Optional: Callback when particles container is loaded
    // await console.log("Particles container loaded:", container);
  }, []);

  // Memoize options to prevent unnecessary re-renders
  const particleOptions = useMemo(() => ({
    background: {
      color: {
        value: "#0d1117", // Darker background for better contrast
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: "#ffffff",
      },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.2, // Slightly more subtle links
        width: 1,
      },
      collisions: {
        enable: false,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "out", // Particles move out of bounds instead of bouncing
        },
        random: true,
        speed: 0.5, // Even slower speed
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 900, // Slightly less dense
        },
        value: 60, // Fewer particles
      },
      opacity: {
        value: { min: 0.1, max: 0.5 }, // Varying opacity
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  }), []); // Empty dependency array ensures options are created once


  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      position: 'relative', // Crucial for positioning the Particles component
      overflow: 'hidden', // Prevent scrollbars if particles go slightly out
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      p: 3,
      backgroundColor: '#0d1117' // Set fallback background color
    }}>
      {init ? (
        <Particles
          id="tsparticles"
          loaded={particlesLoaded}
          options={particleOptions}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0 // Ensure particles are behind content
          }}
        />
      ) : (
        // Optional: Show a loader while the engine initializes
        <CircularProgress sx={{ position: 'absolute', zIndex: 0 }} />
      )}
      {/* Content Box - Ensure it's above particles */}
      <Box sx={{ position: 'relative', zIndex: 1, color: 'white' }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2, textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
          Welcome to MOG AI
        </Typography>
        <Typography variant="h5" paragraph sx={{ mb: 4, maxWidth: '700px', opacity: 0.9, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
          Leveraging Artificial Intelligence for advanced spinal assessment and personalized insights.
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/intro"
          size="large"
          sx={{
            mt: 4,
            px: 6,
            py: 1.5,
            fontSize: '1.1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#1a1a2e', // Dark text matching background
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 20px rgba(255, 255, 255, 0.3)',
            },
            transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          }}
        >
          Begin Assessment
        </Button>
      </Box>
    </Box>
  );
}

export default HomePage;
