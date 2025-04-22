import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Slider, TextField } from '@mui/material';

/**
 * Super simple body model visualization that doesn't rely on THREE.js
 * Uses SVG for the body outline and interactive points
 * This is the absolute last resort if both 3D and 2D models fail
 */
const SimpleBodyModel = ({ onChange, disabled = false }) => {
  const [painPoints, setPainPoints] = useState({});
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [painLevel, setPainLevel] = useState(5);
  
  // Define body regions and their coordinates
  const bodyRegions = [
    { id: 'head', label: 'Head', x: 150, y: 40, radius: 30 },
    { id: 'neck', label: 'Neck', x: 150, y: 80, radius: 15 },
    { id: 'leftShoulder', label: 'Left Shoulder', x: 120, y: 100, radius: 20 },
    { id: 'rightShoulder', label: 'Right Shoulder', x: 180, y: 100, radius: 20 },
    { id: 'chest', label: 'Chest', x: 150, y: 130, radius: 25 },
    { id: 'leftArm', label: 'Left Arm', x: 100, y: 150, radius: 20 },
    { id: 'rightArm', label: 'Right Arm', x: 200, y: 150, radius: 20 },
    { id: 'abdomen', label: 'Abdomen', x: 150, y: 170, radius: 25 },
    { id: 'lowerBack', label: 'Lower Back', x: 150, y: 195, radius: 20 },
    { id: 'leftHip', label: 'Left Hip', x: 125, y: 220, radius: 20 },
    { id: 'rightHip', label: 'Right Hip', x: 175, y: 220, radius: 20 },
    { id: 'leftLeg', label: 'Left Leg', x: 130, y: 270, radius: 20 },
    { id: 'rightLeg', label: 'Right Leg', x: 170, y: 270, radius: 20 },
    { id: 'leftFoot', label: 'Left Foot', x: 130, y: 320, radius: 15 },
    { id: 'rightFoot', label: 'Right Foot', x: 170, y: 320, radius: 15 },
  ];

  // Handle clicking on a body region
  const handleRegionClick = (regionId) => {
    if (disabled) return;
    
    setSelectedPoint(regionId);
    // If we already have pain for this region, use that level
    if (painPoints[regionId]) {
      setPainLevel(painPoints[regionId]);
    } else {
      setPainLevel(5); // Default to middle of scale
    }
  };

  // Handle changing the pain level for selected region
  const handlePainLevelChange = (event, newValue) => {
    if (disabled || !selectedPoint) return;
    
    setPainLevel(newValue);
    
    // Update pain points
    const updatedPoints = {
      ...painPoints,
      [selectedPoint]: newValue
    };
    
    setPainPoints(updatedPoints);
    
    // Notify parent component of changes
    if (onChange) {
      onChange(updatedPoints);
    }
  };

  // Get color based on pain level
  const getPainColor = (level) => {
    if (level <= 3) return '#ffaa00'; // Yellow for mild
    if (level <= 7) return '#ff6600'; // Orange for moderate
    return '#ff0000'; // Red for severe
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      p: 2
    }}>
      <Typography variant="h6" gutterBottom align="center">
        Simple Body Pain Map
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} align="center">
        Click on a body region to mark your pain level
      </Typography>
      
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        {/* Simple SVG body outline */}
        <svg width="300" height="400" viewBox="0 0 300 400">
          {/* Draw a simple body outline */}
          <ellipse cx="150" cy="40" rx="30" ry="35" fill="#f0f0f0" stroke="#888" strokeWidth="1" />
          <rect x="135" y="75" width="30" height="20" fill="#f0f0f0" stroke="#888" strokeWidth="1" />
          <rect x="120" y="95" width="60" height="70" fill="#f0f0f0" stroke="#888" strokeWidth="1" />
          <rect x="130" y="165" width="40" height="60" fill="#f0f0f0" stroke="#888" strokeWidth="1" />
          
          {/* Left arm */}
          <rect x="90" y="110" width="30" height="80" fill="#f0f0f0" stroke="#888" strokeWidth="1" />
          
          {/* Right arm */}
          <rect x="180" y="110" width="30" height="80" fill="#f0f0f0" stroke="#888" strokeWidth="1" />
          
          {/* Legs */}
          <rect x="120" y="225" width="25" height="100" fill="#f0f0f0" stroke="#888" strokeWidth="1" />
          <rect x="155" y="225" width="25" height="100" fill="#f0f0f0" stroke="#888" strokeWidth="1" />
          
          {/* Interactive points */}
          {bodyRegions.map((region) => (
            <g key={region.id}>
              <circle 
                cx={region.x} 
                cy={region.y} 
                r={region.radius} 
                fill={painPoints[region.id] ? getPainColor(painPoints[region.id]) : 'transparent'}
                fillOpacity={painPoints[region.id] ? 0.5 : 0}
                stroke={selectedPoint === region.id ? '#333' : 'transparent'}
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
                onClick={() => handleRegionClick(region.id)}
              />
              <text 
                x={region.x} 
                y={region.y} 
                fontSize="10" 
                fill="#666" 
                textAnchor="middle" 
                dominantBaseline="middle"
                pointerEvents="none"
              >
                {painPoints[region.id] ? `${painPoints[region.id]}` : ''}
              </text>
            </g>
          ))}
        </svg>
      </Box>
      
      {selectedPoint && (
        <Paper 
          elevation={2}
          sx={{
            p: 2,
            mt: 2,
            borderRadius: 2
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            {bodyRegions.find(r => r.id === selectedPoint)?.label || 'Selected Region'}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 1 }}>
            Pain Level: {painLevel}/10
          </Typography>
          
          <Slider
            value={painLevel}
            onChange={handlePainLevelChange}
            min={0}
            max={10}
            step={1}
            marks
            disabled={disabled}
            sx={{
              color: getPainColor(painLevel)
            }}
          />
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              // Remove this pain point
              const newPoints = { ...painPoints };
              delete newPoints[selectedPoint];
              setPainPoints(newPoints);
              setSelectedPoint(null);
              
              // Notify parent of change
              if (onChange) {
                onChange(newPoints);
              }
            }}
            disabled={disabled}
            sx={{ mt: 2 }}
          >
            Remove
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default SimpleBodyModel; 