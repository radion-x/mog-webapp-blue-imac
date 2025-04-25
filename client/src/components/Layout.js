import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Box, CircularProgress, Fab, useTheme } from '@mui/material'; // Removed AppBar, Toolbar, IconButton. Added Fab
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Dark mode icon
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Light mode icon
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim"; // Using slim bundle
import { useThemeContext } from '../App'; // Import the context hook

function Layout({ children }) {
  const [init, setInit] = useState(false);
  const { themeMode, toggleThemeMode } = useThemeContext(); // Consume theme context
  const theme = useTheme(); // Get the current MUI theme object for colors (still needed for AppBar/Content)

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

  // Memoize options - Dynamic based on theme for background AND particle/link colors
  const particleOptions = useMemo(() => ({
    background: {
      color: {
        // Use the theme's default background for the particle canvas itself
        value: theme.palette.background.default,
      },
    },
    fpsLimit: 60, // Keep original fpsLimit
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
        // Use the theme's primary text color for the particles
        value: theme.palette.text.primary,
      },
      links: {
        // Use the theme's primary text color for the links
        color: theme.palette.text.primary,
        distance: 150,
        enable: true,
        opacity: 0.2, // Adjust opacity if needed for visibility on light/dark
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
    // Options now depend on the theme's background and text colors
  }), [theme.palette.background.default, theme.palette.text.primary]);

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      overflow: 'hidden', // Keep overflow hidden
      display: 'flex',
      flexDirection: 'column',
      // The main Box background is already correctly set by the theme
      backgroundColor: theme.palette.background.default,
    }}>
      {/* Particles Background (Now dynamically themed based on MUI theme) */}
      {init ? (
        <Particles
          id="tsparticles-layout"
          loaded={particlesLoaded}
          options={particleOptions}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1 // Keep behind content
          }}
        />
      ) : (
        <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0 }} />
      )}

      {/* Floating Action Button for Theme Toggle */}
      <Fab
        size="small"
        onClick={toggleThemeMode}
        color="primary" // Changed to primary color for potentially better contrast
        aria-label="toggle theme"
        sx={{
          position: 'fixed',
          bottom: 16, // 16px from bottom
          right: 16, // 16px from right
          zIndex: theme.zIndex.drawer + 2 // Ensure it's above most content
        }}
      >
        {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </Fab>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          position: 'relative', // Keep relative for z-index stacking if needed later
          zIndex: 1, // Ensure content is above the fixed particles background
          flexGrow: 1, // Allow content area to grow
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          // Add padding to prevent content from hiding behind AppBar if AppBar wasn't transparent/minimal
          // pt: `${theme.mixins.toolbar.minHeight}px`, // Example if AppBar had solid background
          p: 3, // Add general padding for content spacing
        }}
      >
        {children} {/* Render the specific page content */}
      </Box>
    </Box>
  );
}

export default Layout;
