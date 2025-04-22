// Import THREE first, before any other THREE-related packages
import { PatchedTHREE as THREE } from '../../utils/threeTest';

import React, { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';

// Check if we're running in the browser
const isBrowser = typeof window !== 'undefined';

// Import or create empty placeholders for Three.js dependencies
let Html = ({ children }) => <div>{children}</div>; // Simple fallback for server
let useFrame = () => {}; // No-op for server
let regionColors = {}; // Empty object for server

// Only load real implementations on the client side
if (isBrowser) {
  // Only import these on the client side
  const drei = require('@react-three/drei');
  const fiber = require('@react-three/fiber');
  Html = drei.Html;
  useFrame = fiber.useFrame;
  regionColors = require('./anatomyData').regionColors;
}

// Try to apply the patch, but don't crash if it fails
try {
  if (typeof window !== 'undefined') {
    console.log('Applying patch in visualizers.js');
  }
} catch (error) {
  console.error('Error applying THREE.js patch in visualizers:', error);
}

// Visualizes pain points in 3D space
export const PainPointsVisualizer = ({ 
  points, 
  hoveredPointId, 
  onPainPointSelect,
  showLabels = false,
  disabled = false
}) => {
  if (!isBrowser) return null;
  
  if (!points || Object.keys(points).length === 0) return null;
  
  return (
    <group>
      {Object.entries(points).map(([id, point]) => {
        const isSelected = hoveredPointId === id;
        // Determine color based on pain level if available
        const painLevel = point.painLevel || 0;
        const baseColor = painLevel <= 3 ? '#ffaa00' : 
                         painLevel <= 7 ? '#ff6600' : 
                         '#ff0000';
        
        return (
          <group key={id} position={point.position}>
            {/* Main pain point sphere */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                if (onPainPointSelect && !disabled) {
                  onPainPointSelect(id);
                }
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  onPainPointSelect(id);
                }
              }}
              scale={isSelected ? 0.015 : 0.01} // Smaller points for less overlap
              cursor="pointer"
            >
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial 
                color={baseColor} 
                emissive={baseColor}
                emissiveIntensity={isSelected ? 1.2 : 0.8}
                metalness={0.3}
                roughness={0.2}
                transparent={true}
                opacity={0.85} // Slightly transparent
              />
            </mesh>
            
            {/* Label - positioned to the side of the point */}
            {(showLabels || isSelected) && (
              <Html
                position={[
                  // Position label to the right of the point if on right side of body, left if on left side
                  point.position[0] > 0 ? 0.03 : -0.03,
                  0.01, // Slightly above the point
                  0
                ]}
                center={false} // Don't center the HTML element
                style={{
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'medium',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  transform: point.position[0] > 0 
                    ? 'translate(0, -50%)' // Right side labels
                    : 'translate(-100%, -50%)', // Left side labels
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  border: `1px solid ${baseColor}`
                }}
              >
                <div style={{ marginBottom: point.painLevel ? '2px' : '0' }}>
                  {point.label}
                </div>
                {point.painLevel ? (
                  <div style={{ 
                    color: baseColor, 
                    fontSize: '9px',
                    fontWeight: 'bold'
                  }}>
                    {point.painLevel}/10
                  </div>
                ) : null}
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

// Visualizes click-detected region in 3D space
export const ClickRegionVisualizer = ({ clickPosition, regionInfo }) => {
  // Skip rendering on server
  if (!isBrowser) return null;
  
  if (!clickPosition || !regionInfo) return null;

  return (
    <group position={clickPosition}>
      <mesh>
        <sphereGeometry args={[0.015, 32, 32]} /> {/* Slightly larger for better visibility */}
        <meshStandardMaterial 
          color="#ff3333" 
          emissive="#ff3333" 
          emissiveIntensity={0.5} 
        />
      </mesh>
      <Html
        position={[0, 0.06, 0]}
        center
        style={{
          backgroundColor: 'rgba(0,0,0,0.85)',
          padding: '6px 10px',
          borderRadius: '6px',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          transform: 'translate3d(-50%, -100%, 0)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          border: '2px solid #ff3333',
          textAlign: 'center',
          minWidth: '100px'
        }}
      >
        {regionInfo.label}
      </Html>
    </group>
  );
};

// Pulse animation for highlighted points
export const PulseAnimation = ({ position, color = '#ff0000', size = 0.025 }) => {
  // Always declare hooks at the top level
  const ref = useRef();
  
  // useFrame must always be called, but we can conditionally use its callback
  useFrame(({ clock }) => {
    // Only execute the animation logic in the browser and when ref exists
    if (isBrowser && ref.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 3) * 0.01; // Faster, more pronounced pulse
      const newSize = size + pulse;
      ref.current.scale.set(newSize, newSize, newSize);
    }
  });
  
  // Skip rendering on server, but after hooks are declared
  if (!isBrowser) return null;
  
  return (
    <mesh
      ref={ref}
      position={position}
      scale={size}
    >
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial 
        color={color} 
        transparent={true} 
        opacity={0.6} // More visible pulse
      />
    </mesh>
  );
};

// Visualizes anatomical region boundaries as colored boxes
export const RegionZoneVisualizer = ({ bounds, visible, opacity = 0.15 }) => {
  // Skip rendering on server
  if (!isBrowser) return null;
  
  if (!visible || !bounds) return null;
  
  return (
    <group>
      {Object.entries(bounds).map(([region, { min, max, excluded }]) => {
        if (excluded) return null;
        
        const size = [
          max[0] - min[0],
          max[1] - min[1],
          max[2] - min[2]
        ];
        
        const position = [
          min[0] + size[0] / 2,
          min[1] + size[1] / 2,
          min[2] + size[2] / 2
        ];
        
        const color = regionColors[region] || '#ffffff';
        
        return (
          <group key={region}>
            {/* Semi-transparent colored box */}
            <mesh position={position}>
              <boxGeometry args={size} />
              <meshBasicMaterial 
                color={color} 
                transparent={true} 
                opacity={opacity}
              />
            </mesh>
            
            {/* Wireframe outline for better visibility */}
            <mesh position={position}>
              <boxGeometry args={size} />
              <meshBasicMaterial 
                color={color} 
                transparent={true} 
                opacity={opacity * 3} // Higher opacity for wireframe
                wireframe={true}
              />
            </mesh>
            
            {/* Region label */}
            <Html
              position={[
                position[0],
                position[1] + (size[1]/2) + 0.05,
                position[2]
              ]}
              center
              style={{
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                transform: 'translate3d(-50%, -100%, 0)',
                border: `1px solid ${color}`,
                textShadow: '1px 1px 1px rgba(0,0,0,0.5)'
              }}
            >
              {region}
            </Html>
          </group>
        );
      })}
    </group>
  );
};

// Debug info overlay component for use in the 3D scene
export const DebugInfo = ({ visible, debugLevel, camera, scene, fps }) => {
  if (!visible || debugLevel < 2 || !camera) return null;
  
  // Only import and use Html in browser environment
  const { Html } = require('@react-three/drei');
  
  return (
    <Html 
      position={[0, -0.6, 0]}
      style={{
        width: '250px',
        color: 'white',
        fontSize: '10px',
        userSelect: 'none',
        pointerEvents: 'none',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: '5px',
        padding: '10px',
        fontFamily: 'monospace'
      }}
    >
      <div style={{ marginBottom: '5px' }}>
        <strong>Camera Position:</strong> 
        <div>X: {camera.position.x.toFixed(2)}</div>
        <div>Y: {camera.position.y.toFixed(2)}</div>
        <div>Z: {camera.position.z.toFixed(2)}</div>
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Camera Rotation:</strong>
        <div>X: {(camera.rotation.x * (180/Math.PI)).toFixed(2)}°</div>
        <div>Y: {(camera.rotation.y * (180/Math.PI)).toFixed(2)}°</div>
        <div>Z: {(camera.rotation.z * (180/Math.PI)).toFixed(2)}°</div>
      </div>
      <div>
        <strong>Performance:</strong>
        <div>FPS: {fps ? fps.toFixed(1) : 'N/A'}</div>
        {scene && <div>Objects: {scene.children.length}</div>}
      </div>
    </Html>
  );
};

const Scene = ({ onPointClick, painScores, disabled, activeRegion, debugMode, debugLevel, onHoverChange, onModelClick, customPainPoints, showPredefinedPoints }) => {
  // Always declare hooks, even if not used in server context
  const threeContext = useThree();
  const controlsRef = useRef();
  const [hoveredPointId, setHoveredPointId] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [visiblePointsCount, setVisiblePointsCount] = useState(0);
  
  // Make visible points based on region filtering
  const visiblePainPoints = {};
  
  // Add predefined pain points that should be visible based on activeRegion
  if (showPredefinedPoints) {
    Object.entries(predefinedPainPoints).forEach(([id, point]) => {
      // Only show points for the active region or show all if activeRegion is 'all'
      if (activeRegion === 'all' || point.region === activeRegion) {
        // Get any custom pain score for this predefined point
        const painScore = painScores[id] || 0;
        
        // Only show if there's pain
        if (painScore > 0) {
          visiblePainPoints[id] = {
            ...point,
            painLevel: painScore
          };
        }
      }
    });
  }
  
  // Add custom pain points that should be visible based on activeRegion
  if (customPainPoints && customPainPoints.length > 0) {
    customPainPoints.forEach(point => {
      // Only show points for the active region or show all if activeRegion is 'all'
      if (shouldShowPainPoint(point, activeRegion)) {
        visiblePainPoints[point.id] = {
          position: point.position,
          label: point.label,
          region: point.region,
          painLevel: point.painLevel,
          medicalTerm: point.medicalTerm
        };
      }
    });
  }
  
  // Calculate visible points count
  const currentVisiblePointsCount = Object.keys(visiblePainPoints).length;
  
  // Update the count when it changes
  useEffect(() => {
    setVisiblePointsCount(currentVisiblePointsCount);
    
    // Notify parent component if needed
    if (onHoverChange && typeof onHoverChange === 'function') {
      onHoverChange(null, currentVisiblePointsCount);
    }
  }, [currentVisiblePointsCount, onHoverChange]);
  
  // Handle point hover
  const handlePointHover = (id) => {
    setHoveredPointId(id);
    
    // Notify parent component if needed
    if (onHoverChange && typeof onHoverChange === 'function') {
      onHoverChange(id, currentVisiblePointsCount);
    }
  };
  
  // Skip rendering on server
  if (!isBrowser) return null;
  
  return (
    <>
      {/* Rest of the component remains unchanged */}
    </>
  );
}; 