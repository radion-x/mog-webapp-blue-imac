import * as THREE from 'three';

// Pain level color scale - centralized for consistency throughout the app
export const PAIN_COLORS = {
  none: '#2196f3',      // Blue - No pain (0)
  mild: '#ffd700',      // Yellow - Mild pain (1-3)
  moderate: '#ff8c00',  // Orange - Moderate pain (4-6)
  severe: '#ff0000'     // Red - Severe pain (7-10)
};

// Create a precise gradient for continuous color transition
export const getPainColor = (level) => {
  if (level === 0) return PAIN_COLORS.none;
  
  // For more precise gradient coloring
  if (level <= 3) {
    // Blend between blue and yellow (none to mild)
    const ratio = level / 3;
    const colorNone = new THREE.Color(PAIN_COLORS.none);
    const colorMild = new THREE.Color(PAIN_COLORS.mild);
    return colorNone.lerp(colorMild, ratio).getHexString();
  } else if (level <= 6) {
    // Blend between yellow and orange (mild to moderate)
    const ratio = (level - 3) / 3;
    const colorMild = new THREE.Color(PAIN_COLORS.mild);
    const colorModerate = new THREE.Color(PAIN_COLORS.moderate);
    return colorMild.lerp(colorModerate, ratio).getHexString();
  } else {
    // Blend between orange and red (moderate to severe)
    const ratio = (level - 6) / 4;
    const colorModerate = new THREE.Color(PAIN_COLORS.moderate);
    const colorSevere = new THREE.Color(PAIN_COLORS.severe);
    return colorModerate.lerp(colorSevere, ratio).getHexString();
  }
}; 