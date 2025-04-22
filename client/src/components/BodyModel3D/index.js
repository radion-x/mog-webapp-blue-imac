import React, { useState, useRef, useEffect, Suspense } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Slider, 
  TextField, 
  IconButton,
  Divider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Tooltip,
  Fade,
  useTheme,
  Collapse
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  BugReport as BugReportIcon,
  Help as HelpIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Import debug utilities
import { debugLog, checkBrowserCompatibility, DEBUG_LEVELS } from '../../utils/debugUtils';

// Import THREE first, before any other THREE-related packages
// This ensures patches are applied before other modules that might use THREE
import { PatchedTHREE as THREE, testThreeJs } from '../../utils/threeTest';

// Import shared data and utilities
import { bodyRegions, painPoints as predefinedPainPoints, regionBounds, regionColors, determineBodyRegion } from './anatomyData';
import { PAIN_COLORS, getPainColor } from './constants';
import { shouldShowPainPoint } from './utils';

// Import Three.js related modules for client-side only
// We import them but will only use them after checking if we're in a browser
let fiber;
let drei;
let visualizers;

if (typeof window !== 'undefined') {
  // Dynamically import for client-side only
  fiber = require('@react-three/fiber');
  drei = require('@react-three/drei');
  visualizers = require('./visualizers');
  
  // Preload the model
  if (drei.useGLTF && drei.useGLTF.preload) {
    drei.useGLTF.preload('/human_body_base_cartoon_gltf/scene.gltf');
  }
}

// Check if we're running in the browser
const isBrowser = typeof window !== 'undefined';

// Run the THREE.js test
try {
  debugLog('BodyModel3D', 'Testing THREE.js initialization...', null, 'info');
  const testResult = testThreeJs();
  debugLog('BodyModel3D', 'THREE.js test result:', testResult ? 'SUCCESS' : 'FAILED', testResult ? 'info' : 'error');
} catch (error) {
  debugLog('BodyModel3D', 'THREE.js test error:', error, 'error');
}

// Check browser compatibility when in browser environment
if (isBrowser) {
  try {
    const compatInfo = checkBrowserCompatibility();
    if (!compatInfo.compatibility) {
      debugLog('BodyModel3D', 'Browser compatibility issues detected', compatInfo.issues, 'warn');
    }
  } catch (error) {
    debugLog('BodyModel3D', 'Error checking browser compatibility', error, 'error');
  }
}

// Import placeholders for server-side rendering
let Canvas = () => null;
let Html = ({ children }) => <div>{children}</div>;
let useThree = () => ({ camera: null, scene: null });
let useGLTF = () => ({ scene: null });
let useFrame = () => {};
let OrbitControls = () => null;
let PerspectiveCamera = () => null;
let PainPointsVisualizer = () => null;
let PulseAnimation = () => null;
let RegionZoneVisualizer = () => null;
let DebugInfo = () => null;

// Only initialize Three.js related modules on the client side
if (isBrowser && fiber && drei && visualizers) {
  Canvas = fiber.Canvas;
  useThree = fiber.useThree;
  useGLTF = drei.useGLTF;
  OrbitControls = drei.OrbitControls;
  Html = drei.Html;
  PerspectiveCamera = drei.PerspectiveCamera;
  
  // Load visualizers
  PainPointsVisualizer = visualizers.PainPointsVisualizer;
  PulseAnimation = visualizers.PulseAnimation;
  RegionZoneVisualizer = visualizers.RegionZoneVisualizer;
  DebugInfo = visualizers.DebugInfo;
}

// Model loader placeholder
const ModelLoader = () => {
  if (!isBrowser) return null;
  
  return (
    <Html center>
      <Box 
        sx={{ 
          background: 'rgba(255,255,255,0.9)', 
          padding: '30px', 
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 500, color: '#1976d2' }}>
          Loading 3D Model
        </Typography>
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', textAlign: 'center' }}>
          Please wait while we prepare the interactive body model
        </Typography>
        <Box 
          sx={{ 
            width: 60, 
            height: 60, 
            borderRadius: '50%',
            border: '4px solid #e0e0e0',
            borderTopColor: '#1976d2',
            animation: 'spin 1.2s cubic-bezier(0.4, 0.1, 0.3, 1) infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }} 
        />
      </Box>
    </Html>
  );
};

// Debug boundaries - visualizes front/back plane
const RegionBoundaryVisualizer = ({ debugMode, debugLevel }) => {
  if (!isBrowser || !debugMode || debugLevel < 2) return null;
  
  return (
    <>
      {/* Front plane at z=0.00 */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.6, 1.2]} />
        <meshBasicMaterial 
          color="rgba(255,0,0,0.5)" 
          transparent={true} 
          opacity={0.1} 
          side={THREE.DoubleSide}
          depthWrite={false} 
        />
      </mesh>
      <Html
        position={[0.25, 0.3, 0]}
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '2px 5px',
          borderRadius: '3px',
          fontSize: '10px',
          fontFamily: 'Arial',
          whiteSpace: 'nowrap'
        }}
      >
        <div>Front/Back Boundary (z=0.00)</div>
      </Html>
      
      {/* Back plane at z=-0.01 */}
      <mesh position={[0, 0, -0.01]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.6, 1.2]} />
        <meshBasicMaterial 
          color="rgba(0,0,255,0.5)" 
          transparent={true} 
          opacity={0.1} 
          side={THREE.DoubleSide}
          depthWrite={false} 
        />
      </mesh>
      <Html
        position={[0.25, 0.3, -0.01]}
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '2px 5px',
          borderRadius: '3px',
          fontSize: '10px',
          fontFamily: 'Arial',
          whiteSpace: 'nowrap'
        }}
      >
        <div>Back Boundary (z=-0.01)</div>
      </Html>
    </>
  );
};

// GLTF Model Component
const HumanModel = ({ onModelClick, disabled }) => {
  // Always declare hooks regardless of browser environment - don't use ternary for the hook itself
  const modelRef = useRef();
  
  // Call useGLTF unconditionally
  const gltfResult = useGLTF('/human_body_base_cartoon_gltf/scene.gltf');
  
  // Use effect for model setup
  useEffect(() => {
    // Skip processing on server
    if (!isBrowser) return;
    
    const scene = gltfResult?.scene;
    if (modelRef.current && scene) {
      // Make adjustments to the model
      scene.traverse((node) => {
        if (node.isMesh) {
          // Make the model semi-transparent but still visible enough
          node.material.transparent = true;
          node.material.opacity = 0.92;
          node.material.needsUpdate = true;
          node.material.depthWrite = true;
          
          // Add slight outline effect to body
          node.material.envMapIntensity = 0.5; 
          node.material.roughness = 0.65;
          
          // Enable shadows
          node.castShadow = true;
          node.receiveShadow = true;
          
          // Set renderOrder to ensure pain points render above the model
          node.renderOrder = 1;

          // Add click event to the mesh
          node.userData.isBodyPart = true;
        }
      });
      
      // Center the model better
      scene.position.set(0, 0, 0);
      scene.updateMatrixWorld();
    }
  }, [isBrowser, gltfResult]);
  
  if (!isBrowser) return null;
  
  return (
    <primitive 
      ref={modelRef}
      object={gltfResult.scene} 
      scale={[0.55, 0.55, 0.55]}
      position={[0, 0.4, 0]} 
      rotation={[0, 0, 0]} 
      onClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        // Only trigger if we clicked on the body mesh
        if (e.object.userData.isBodyPart) {
          // Get the hit point in world space
          const hitPoint = e.point.clone();
          // Calculate screen position for popup
          const vector = hitPoint.clone().project(e.camera);
          const x = (vector.x + 1) / 2 * window.innerWidth;
          const y = -(vector.y - 1) / 2 * window.innerHeight;
          
          // Generate a unique ID for this custom point
          const customPointId = `custom_${Date.now()}`;
          
          // Call the click handler with the new point information
          onModelClick(customPointId, "Custom Pain Point", { x, y }, hitPoint);
        }
      }}
    />
  );
};

// Update the Scene component to include visualization components
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
          debugLog('PainPoint', `Added predefined pain point: ${id}`, visiblePainPoints[id]);
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
        debugLog('PainPoint', `Added custom pain point: ${point.id}`, visiblePainPoints[point.id]);
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
  
  // Log summary of visible points (outside of useEffect)
  debugLog('Scene', `Total visible pain points: ${currentVisiblePointsCount}`, 
    Object.keys(visiblePainPoints));
  
  // Point hover effects
  const handlePointHover = (id) => {
    if (id) {
      const point = customPainPoints.find(p => p.id === id) || predefinedPainPoints[id];
      setHoverInfo({
        label: point?.label || 'Unknown Point',
        position: point?.position || { x: 0, y: 0 }
      });
      // Set the selected point ID to maintain the selection
      setHoveredPointId(id);
    } else {
      setHoverInfo(null);
    }
  };
  
  // Skip rendering on server
  if (!isBrowser) return null;
  
  const { camera, scene } = threeContext;
  
  return (
    <>
      {/* Camera and lights */}
      <PerspectiveCamera 
        makeDefault 
        fov={30} 
        position={[0, 0.25, 2.0]} 
        near={0.1}
        far={1000}
      />
      <ambientLight intensity={0.7} />
      <directionalLight 
        intensity={1.0} 
        position={[5, 5, 5]} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight intensity={0.5} position={[-5, 5, -5]} />
      <directionalLight intensity={0.4} position={[0, -5, 0]} />
      <hemisphereLight intensity={0.4} color="#ffffff" groundColor="#bbbbff" />
      
      {/* Scene background */}
      {isBrowser && (
        <>
          <color attach="background" args={['#f8f9fa']} />
          <fog attach="fog" args={['#f8f9fa', 10, 20]} />
        </>
      )}
      
      {/* Model */}
      <Suspense fallback={<ModelLoader />}>
        <HumanModel onModelClick={onModelClick} disabled={disabled} />
      </Suspense>
      
      {/* Region visualization - only in debug mode */}
      {debugMode && debugLevel >= 2 && (
        <RegionBoundaryVisualizer />
      )}
      
      {/* Render zone visualizers for all regions in advanced debug */}
      <RegionZoneVisualizer 
        bounds={regionBounds} 
        visible={debugMode && debugLevel >= 3} 
        opacity={0.15}
      />
      
      {/* Hover info tooltip - Only show in debug mode */}
      {hoverInfo && debugMode && debugLevel >= 1 && (
        <Html 
          position={[hoverInfo.position.x, hoverInfo.position.y, 0]}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            transform: 'translate(-50%, -100%)',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <div>{hoverInfo.label}</div>
        </Html>
      )}
      
      {/* Visualize pain points */}
      <PainPointsVisualizer 
        points={visiblePainPoints} 
        onPainPointSelect={(id) => {
          console.log("%c PAIN POINT SELECTED IN SCENE", "background: lightblue; color: black; font-size: 16px", {
            id,
            hasOnPointClick: !!onPointClick,
            painScores,
            visiblePoints: Object.keys(visiblePainPoints)
          });
          setHoveredPointId(id);
          if (onPointClick) {
            console.log("Calling onPointClick with id:", id);
            onPointClick(id);
          } else {
            console.warn("No onPointClick handler defined in Scene component");
          }
        }}
        showLabels={debugMode && debugLevel >= 2}
        hoveredPointId={hoveredPointId}
        disabled={disabled}
      />
      
      {/* Pulse animation for highlighted points */}
      {hoveredPointId && visiblePainPoints[hoveredPointId] && (
        <PulseAnimation 
          position={visiblePainPoints[hoveredPointId].position}
          color={getPainColor(visiblePainPoints[hoveredPointId].painLevel)}
        />
      )}
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        minDistance={1.0}
        maxDistance={3.0}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI * 5 / 6}
        enableDamping
        dampingFactor={0.1}
        target={[0, 0.3, 0]} 
        rotateSpeed={0.65}
        autoRotate={false}
        autoRotateSpeed={0}
        screenSpacePanning={true}
      />
    </>
  );
};

// Main BodyModel3D component
const BodyModel3D = ({ onChange, disabled = false, debugMode: externalDebugMode }) => {
  const theme = useTheme();
  const containerRef = useRef(null);
  
  // State management for the 3D viewer
  const [modelError, setModelError] = useState(false);
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [customPainPoints, setCustomPainPoints] = useState([]);
  const [painScores, setPainScores] = useState({});
  const [hoverRegionInfo, setHoverRegionInfo] = useState(null);
  const [showPredefinedPoints, setShowPredefinedPoints] = useState(true);
  const [showExpandedPainInput, setShowExpandedPainInput] = useState(false);

  // Compute the selected point details based on selectedPointId
  const selectedPoint = getSelectedPointDetails(selectedPointId);

  // Effect to notify parent component of pain score changes
  useEffect(() => {
    if (onChange && typeof onChange === 'function') {
      // Only include points that have a pain level > 0
      const validPainScores = Object.entries(painScores)
        .reduce((acc, [id, level]) => {
          if (level > 0) {
            acc[id] = level;
          }
          return acc;
        }, {});
      
      console.log('Notifying parent of pain scores:', validPainScores);
      onChange(validPainScores);
    }
  }, [painScores, onChange]);

  // Point selection handlers
  const handlePointClick = (id) => {
    console.log("Point clicked:", id, ", previous selected point:", selectedPointId);
    
    // If selecting a different point, expand the details view
    if (id !== selectedPointId) {
      setShowExpandedPainInput(true);
    }
    
    setSelectedPointId(id);
  };

  // Get details for the currently selected point
  function getSelectedPointDetails(pointId) {
    // Log for debugging
    console.log("Getting details for point ID:", pointId);
    
    if (!pointId) {
      console.log("No point selected");
      return null;
    }
    
    // Check if it's a predefined point
    const predefinedPoint = predefinedPainPoints[pointId];
    if (predefinedPoint) {
      console.log("Found predefined point:", predefinedPoint);
      return {
        ...predefinedPoint,
        isPredefined: true,
        painLevel: painScores[pointId] || 0
      };
    }
    
    // Check if it's a custom point
    const customPoint = customPainPoints.find(p => p.id === pointId);
    if (customPoint) {
      console.log("Found custom point:", customPoint);
      return {
        ...customPoint,
        isPredefined: false
      };
    }
    
    console.log("Point ID not found in predefined or custom points:", pointId);
    return null;
  }

  // Point hover effects
  const handlePointHover = (id) => {
    if (id) {
      const point = customPainPoints.find(p => p.id === id) || predefinedPainPoints[id];
      setHoverRegionInfo({
        label: point?.label || 'Unknown Point',
        position: point?.position || { x: 0, y: 0 }
      });
      // Set the selected point ID to maintain the selection
      setSelectedPointId(id);
    }
  };

  // Close/clear the current pain input
  const handleCloseInput = () => {
    setSelectedPointId(null);
  };

  // Update pain level for a point
  const handlePainLevelChange = (pointId, level) => {
    if (disabled) return;
    
    // Update the pain score
    setPainScores(prev => ({
      ...prev,
      [pointId]: level
    }));
    
    // For custom points, also update the painLevel in the custom point object
    if (!predefinedPainPoints[pointId]) {
      setCustomPainPoints(prev => 
        prev.map(point => 
          point.id === pointId 
            ? { ...point, painLevel: level } 
            : point
        )
      );
    }
  };

  // Update notes for a pain point
  const handleNotesChange = (pointId, notes) => {
    if (disabled) return;
    
    // Only custom points have notes
    setCustomPainPoints(prev => 
      prev.map(point => 
        point.id === pointId 
          ? { ...point, notes } 
          : point
      )
    );
  };

  // Handle clicking on the model to add a custom pain point
  const handleModelClick = (id, label, screenPos, worldPos) => {
    if (disabled) return;
    
    console.log("Model clicked:", { id, label, screenPos, worldPos });
    
    // Determine which body region was clicked
    const regionInfo = determineBodyRegion([worldPos.x, worldPos.y, worldPos.z]);
    console.log("Detected body region:", regionInfo);
    
    if (regionInfo) {
      // Create a new custom pain point
      const newPoint = {
        id,
        label: regionInfo.label || "Custom Point",
        region: regionInfo.region || "undefined",
        position: [worldPos.x, worldPos.y, worldPos.z],
        painLevel: 5,
        notes: "",
        medicalTerm: regionInfo.medicalTerm
      };
      
      console.log("Creating new pain point:", newPoint);
      
      // Add the new point to our custom points
      setCustomPainPoints(prev => [...prev, newPoint]);
      console.log("Custom pain points updated:", [...customPainPoints, newPoint]);
      
      // Set initial pain score to 5 (medium)
      setPainScores(prev => ({
        ...prev,
        [id]: 5
      }));
      console.log("Pain scores updated with new point:", { ...painScores, [id]: 5 });
      
      // Select the new point
      setSelectedPointId(id);
      
      // Ensure expanded view is shown for new points
      setShowExpandedPainInput(true);
    }
  };

  // Toggle predefined points visibility
  const togglePredefinedPoints = () => {
    setShowPredefinedPoints(prev => !prev);
  };

  // Delete a custom pain point
  const handleDeleteCustomPoint = (pointId) => {
    if (disabled) return;
    
    // Remove the point from custom points
    setCustomPainPoints(prev => prev.filter(p => p.id !== pointId));
    
    // Remove the pain score
    setPainScores(prev => {
      const newScores = { ...prev };
      delete newScores[pointId];
      return newScores;
    });
    
    // Clear selection if the deleted point was selected
    if (selectedPointId === pointId) {
      setSelectedPointId(null);
    }
  };

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 400,
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Canvas
        camera={{ 
          position: [0, 0.25, 1.2], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        style={{
          background: theme.palette.background.default
        }}
      >
        <Scene 
          onPointClick={handlePointClick}
          painScores={painScores}
          disabled={disabled}
          debugMode={false}
          debugLevel={0}
          onHoverChange={handlePointHover}
          onModelClick={handleModelClick}
          customPainPoints={customPainPoints}
          showPredefinedPoints={showPredefinedPoints}
        />
      </Canvas>

      {/* Pain Input Panel - Positioned to not overlap with 3D model */}
      {selectedPoint && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 280,
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              {selectedPoint.label}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleDeleteCustomPoint(selectedPointId)}
              disabled={disabled}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            Pain Level: {selectedPoint.painLevel}/10
          </Typography>

          <Slider
            value={selectedPoint.painLevel}
            onChange={(_, value) => handlePainLevelChange(selectedPointId, value)}
            aria-labelledby="pain-level-slider"
            valueLabelDisplay="auto"
            step={1}
            min={0}
            max={10}
            disabled={disabled}
            size="small"
            marks={[
              { value: 0, label: '0' },
              { value: 10, label: '10' }
            ]}
            sx={{
              color: selectedPoint.painLevel <= 3 ? PAIN_COLORS.mild : 
                     selectedPoint.painLevel <= 7 ? PAIN_COLORS.moderate : 
                     PAIN_COLORS.severe,
              height: 4,
              '& .MuiSlider-thumb': {
                height: 18,
                width: 18,
                backgroundColor: '#fff',
                border: `2px solid ${selectedPoint.painLevel <= 3 ? PAIN_COLORS.mild : 
                        selectedPoint.painLevel <= 7 ? PAIN_COLORS.moderate : 
                        PAIN_COLORS.severe}`,
              },
              '& .MuiSlider-valueLabel': {
                backgroundColor: selectedPoint.painLevel <= 3 ? PAIN_COLORS.mild : 
                                selectedPoint.painLevel <= 7 ? PAIN_COLORS.moderate : 
                                PAIN_COLORS.severe,
              },
            }}
          />

          <TextField
            multiline
            rows={2}
            placeholder="Add notes about your pain (optional)"
            value={selectedPoint.notes || ''}
            onChange={(e) => handleNotesChange(selectedPointId, e.target.value)}
            disabled={disabled}
            fullWidth
            size="small"
            sx={{ mt: 2 }}
          />
        </Paper>
      )}

      {/* Simple hover tooltip */}
      {hoverRegionInfo && (
        <div
          style={{
            position: 'fixed',
            top: hoverRegionInfo.position.y + 10,
            left: hoverRegionInfo.position.x + 10,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            padding: '5px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            pointerEvents: 'none',
            zIndex: 1000,
            maxWidth: '200px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ fontWeight: 'bold' }}>{hoverRegionInfo.label}</div>
          {hoverRegionInfo.medicalTerm && (
            <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '3px' }}>
              {hoverRegionInfo.medicalTerm}
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {modelError && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'error.main',
            p: 2
          }}
        >
          <Typography variant="h6 gutterBottom">
            Error Loading Model
          </Typography>
          <Typography variant="body2">
            Please refresh the page or try again later.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BodyModel3D; 