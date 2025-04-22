/**
 * This file provides a simple test to verify THREE.js is working correctly
 */

import * as THREE from 'three';
import { patchThreeColorManagement } from './threePatch';

// Apply the patch to THREE
try {
  // Color management handled by THREE.js itself
  
  // Explicitly set key components that might be undefined
  if (!THREE.ColorManagement) {
    console.log('Setting up ColorManagement from scratch');
    THREE.ColorManagement = {};
  }
  
  THREE.ColorManagement.enabled = true;
  THREE.ColorManagement.workingColorSpace = 'srgb-linear';
  THREE.ColorManagement.outputColorSpace = 'srgb';
  
  // Make sure the primaries object exists
  if (!THREE.ColorManagement.primaries) {
    console.log('Creating primaries object from scratch');
    THREE.ColorManagement.primaries = {
      srgb: { red: [0.64, 0.33], green: [0.3, 0.6], blue: [0.15, 0.06], white: [0.3127, 0.3290] },
      displayP3: { red: [0.68, 0.32], green: [0.265, 0.69], blue: [0.15, 0.06], white: [0.3127, 0.3290] }
    };
  }
  
  console.log('THREE.js has been successfully patched', THREE.ColorManagement);
} catch (error) {
  console.error('Failed to patch THREE.js:', error);
}

// Create a simple function to test if THREE.js is working
export function testThreeJs() {
  try {
    // Create a simple scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // If we get this far, THREE is working at a basic level
    console.log('THREE.js basic initialization successful');
    
    // More detailed test - create some objects and materials
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    console.log('THREE.js object creation successful');
    
    // Test color management specifically
    try {
      const color = new THREE.Color('#ff0000');
      const workingColor = THREE.ColorManagement.toWorkingColorSpace(color, 'srgb');
      console.log('THREE.js color management working');
    } catch (colorError) {
      console.error('THREE.js color management test failed:', colorError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('THREE.js test failed:', error);
    return false;
  }
}

// Export THREE with our patches
export const PatchedTHREE = THREE;
