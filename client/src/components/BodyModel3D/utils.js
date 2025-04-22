import { Vector3, Raycaster, Vector2 } from 'three';
import { getPainColor } from './constants';

// Determines if a ray from the camera intersects with the model
export const calculateMouseIntersection = (event, camera, model) => {
  if (!event || !camera || !model) return null;
  
  // Get normalized mouse coordinates (-1 to 1)
  const rect = event.target.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  // Create a ray from the camera through the mouse position
  const raycaster = new Raycaster();
  raycaster.setFromCamera({ x, y }, camera);
  
  // Check for intersections with the model
  const intersects = raycaster.intersectObject(model, true);
  
  if (intersects.length === 0) return null;
  
  // Get the first intersection point
  const intersection = intersects[0];
  
  // Get the world coordinates of the intersection
  const position = intersection.point.clone();
  
  return position;
};

// Creates a pain point object from a position and region data
export const createPainPoint = (position, regionInfo, painLevel = 5, notes = '') => {
  if (!position || !regionInfo) return null;
  
  const id = `pain_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  return {
    id,
    position: [position.x, position.y, position.z],
    label: regionInfo.label || 'Unknown Region',
    region: regionInfo.region || 'unspecified',
    medicalTerm: regionInfo.medicalTerm || '',
    painLevel,
    notes,
    createdAt: new Date().toISOString()
  };
};

// Converts an array of pain points to a format suitable for visualization
export const formatPainPointsForVisualization = (painPoints) => {
  if (!painPoints || !Array.isArray(painPoints)) return {};
  
  return painPoints.reduce((acc, point) => {
    acc[point.id] = {
      position: point.position,
      label: `${point.label} (${point.painLevel}/10)`,
      region: point.region,
      painLevel: point.painLevel
    };
    return acc;
  }, {});
};

// Generate a marker sphere geometry for pain visualization
export const createPainMarker = (position, painLevel, selected = false, onClick = null) => {
  const color = getPainColor(painLevel);
  const size = selected ? 0.015 : 0.01;
  
  return (
    <mesh 
      position={position} 
      onClick={onClick ? (e) => {
        e.stopPropagation();
        onClick();
      } : undefined}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={0.5 + (painLevel / 20)}
      />
    </mesh>
  );
};

// Calculate a slightly offset position for text display
export const calculateLabelPosition = (position, offset = [0, 0.03, 0]) => {
  return [
    position[0] + offset[0],
    position[1] + offset[1],
    position[2] + offset[2]
  ];
};

// Determines if a point is within a bounding box
export const isPointInBounds = (point, min, max) => {
  return (
    point.x >= min[0] && point.x <= max[0] &&
    point.y >= min[1] && point.y <= max[1] &&
    point.z >= min[2] && point.z <= max[2]
  );
};

// Finds which anatomical region contains a given point
export const findRegionForPoint = (point, regionBounds) => {
  if (!point || !regionBounds) return null;
  
  for (const [region, bounds] of Object.entries(regionBounds)) {
    if (bounds.excluded) continue;
    
    if (isPointInBounds(point, bounds.min, bounds.max)) {
      return region;
    }
  }
  
  return null;
};

// Creates HTML content for the pain point tooltip
export const createPainPointTooltip = (painPoint) => {
  if (!painPoint) return '';
  
  return `
    <div style="text-align: left;">
      <strong>${painPoint.label}</strong><br />
      Region: ${painPoint.region}<br />
      Pain Level: ${painPoint.painLevel}/10
      ${painPoint.notes ? `<br />Notes: ${painPoint.notes}` : ''}
    </div>
  `;
};

// Converts world coordinates to screen coordinates
export const worldToScreen = (position, camera, canvas) => {
  if (!position || !camera || !canvas) return { x: 0, y: 0 };
  
  const vector = new Vector3(...position);
  vector.project(camera);
  
  return {
    x: (vector.x + 1) / 2 * canvas.width,
    y: -(vector.y - 1) / 2 * canvas.height
  };
};

// Determines if a region filter should show a pain point
export const shouldShowPainPoint = (painPoint, regionFilter) => {
  if (!painPoint) return false;
  if (!regionFilter || regionFilter === 'all') return true;
  
  return painPoint.region === regionFilter;
}; 