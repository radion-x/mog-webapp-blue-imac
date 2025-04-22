/**
 * This file contains patches for common THREE.js issues
 */

// Fix for "Cannot read properties of undefined (reading 'primaries')" error
export const patchThreeColorManagement = (THREE) => {
  if (!THREE) {
    console.warn('THREE.js not provided to patch function');
    return;
  }
  
  console.log('Applying THREE.js ColorManagement patch...');
  
  try {
    // Check if THREE is properly initialized
    if (typeof THREE !== 'object') {
      console.warn('THREE.js not properly initialized');
      return;
    }

    // Only try to set properties if ColorManagement doesn't exist
    if (!THREE.ColorManagement) {
      const colorManagement = {
        enabled: true,
        legacyMode: false,
        workingColorSpace: 'srgb',
        outputColorSpace: 'srgb',
        primaries: {
          srgb: { red: [0.64, 0.33], green: [0.3, 0.6], blue: [0.15, 0.06], white: [0.3127, 0.3290] },
          displayP3: { red: [0.68, 0.32], green: [0.265, 0.69], blue: [0.15, 0.06], white: [0.3127, 0.3290] }
        },
        toWorkingColorSpace: function(color, colorSpace) { return color; },
        fromWorkingColorSpace: function(color, colorSpace) { return color; }
      };

      try {
        // First try to define the property normally
        THREE.ColorManagement = colorManagement;
      } catch (e) {
        try {
          // If that fails, try using Object.defineProperty
          Object.defineProperty(THREE, 'ColorManagement', {
            value: colorManagement,
            writable: true,
            configurable: true,
            enumerable: true
          });
        } catch (defineError) {
          console.warn('Failed to define ColorManagement property:', defineError);
          // As a last resort, try to modify the prototype
          if (THREE.prototype) {
            THREE.prototype.ColorManagement = colorManagement;
          }
        }
      }
    }
    
    // Verify the patch was applied
    if (THREE.ColorManagement) {
      console.log('THREE.js ColorManagement patch applied successfully.');
    } else {
      console.warn('THREE.js ColorManagement patch verification failed');
    }
  } catch (error) {
    console.warn('THREE.js ColorManagement patch failed:', error);
    // Continue execution even if patch fails
  }
};

// Delay the global patch application to ensure THREE is loaded
if (typeof window !== 'undefined') {
  // Wait for the window to load
  window.addEventListener('load', () => {
    try {
      const THREE = require('three');
      if (THREE) {
        // Add a small delay to ensure THREE is fully initialized
        setTimeout(() => {
          patchThreeColorManagement(THREE);
        }, 100);
      }
    } catch (error) {
      console.warn('Early THREE.js patching failed:', error);
      // We'll try again when components load
    }
  });
}

export default { patchThreeColorManagement }; 