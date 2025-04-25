import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim"; // Using slim bundle

function Layout({ children }) {
  const [init, setInit] = useState(false);

  // Initialize tsparticles engine once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    }).catch(error => {
      console.error("Particles engine initialization failed in Layout:", error);
    });
  }, []);

  const particlesLoaded = useCallback(async container => {
    // Optional callback
  }, []);

  // Memoize options
  const particleOptions = useMemo(() => ({
    background: {
      color: {
        value: "#0d1117", // Dark background consistent with HomePage
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
        opacity: 0.2,
        width: 1,
      },
      collisions: {
        enable: false,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "out",
        },
        random: true,
        speed: 0.5,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 900,
        },
        value: 60,
      },
      opacity: {
        value: { min: 0.1, max: 0.5 },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  }), []);

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex', // Use flex to center content potentially
      flexDirection: 'column',
      // justifyContent: 'center', // Center content vertically if needed
      // alignItems: 'center', // Center content horizontally if needed
      backgroundColor: '#0d1117' // Fallback background
    }}>
      {init ? (
        <Particles
          id="tsparticles-layout" // Unique ID for layout particles
          loaded={particlesLoaded}
          options={particleOptions}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0 // Background layer
          }}
        />
      ) : (
        <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', zIndex: 0 }} />
      )}
      {/* Content Area */}
      <Box sx={{
        position: 'relative',
        zIndex: 1, // Ensure content is above particles
        width: '100%',
        flexGrow: 1, // Allow content to take available space
        display: 'flex',
        flexDirection: 'column',
        // Add padding or other styling for content area if needed
        // p: 3 // Example padding
      }}>
        {children} {/* Render the specific page content here */}
      </Box>
    </Box>
  );
}

export default Layout;
