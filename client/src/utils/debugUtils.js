/**
 * Debug utility functions for troubleshooting the application
 */

// Debug levels
export const DEBUG_LEVELS = {
  NONE: 0,
  BASIC: 1,
  ADVANCED: 2,
  FULL: 3
};

// Set this to true to enable debug messages in production
const FORCE_DEBUG = false;

// Check if we're in development environment
const isDev = process.env.NODE_ENV === 'development' || FORCE_DEBUG;

/**
 * Enhanced console logging with debug level control
 * @param {string} component - Component or module name
 * @param {string} message - Message to log
 * @param {any} data - Optional data to include
 * @param {string} type - Log type (log, warn, error, info)
 */
export const debugLog = (component, message, data = null, type = 'log') => {
  if (!isDev) return;
  
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
  const prefix = `[${timestamp}][${component}]`;
  
  // Style for different log types
  let style = '';
  switch (type) {
    case 'error':
      style = 'background: #ffebee; color: #d32f2f; font-weight: bold; padding: 2px 5px; border-radius: 2px;';
      break;
    case 'warn':
      style = 'background: #fff8e1; color: #ff8f00; font-weight: bold; padding: 2px 5px; border-radius: 2px;';
      break;
    case 'info':
      style = 'background: #e3f2fd; color: #1976d2; font-weight: bold; padding: 2px 5px; border-radius: 2px;';
      break;
    default:
      style = 'background: #f1f3f4; color: #424242; padding: 2px 5px; border-radius: 2px;';
  }
  
  if (data) {
    console[type](`%c${prefix} ${message}`, style, data);
  } else {
    console[type](`%c${prefix} ${message}`, style);
  }
};

/**
 * Check browser and WebGL compatibility
 * @returns {Object} Compatibility information
 */
export const checkBrowserCompatibility = () => {
  const info = {
    browser: getBrowserInfo(),
    webgl: hasWebGL(),
    webgl2: hasWebGL2(),
    compatibility: true,
    issues: []
  };
  
  // Check for WebGL support
  if (!info.webgl) {
    info.compatibility = false;
    info.issues.push('WebGL not supported - 3D models cannot be displayed');
  }
  
  // Log compatibility info
  debugLog('Compatibility', 'Browser compatibility check', info, 'info');
  
  return info;
};

/**
 * Get browser information
 * @returns {Object} Browser details
 */
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let version = 'Unknown';
  
  // Chrome
  if (/Chrome/.test(ua) && !/Chromium|Edge|OPR|Edg/.test(ua)) {
    browser = 'Chrome';
    version = ua.match(/Chrome\/(\d+\.\d+)/)[1];
  } 
  // Firefox
  else if (/Firefox/.test(ua)) {
    browser = 'Firefox';
    version = ua.match(/Firefox\/(\d+\.\d+)/)[1];
  } 
  // Safari
  else if (/Safari/.test(ua) && !/Chrome|Chromium|Edge|OPR|Edg/.test(ua)) {
    browser = 'Safari';
    version = ua.match(/Version\/(\d+\.\d+)/)[1];
  } 
  // Edge
  else if (/Edg/.test(ua)) {
    browser = 'Edge';
    version = ua.match(/Edg\/(\d+\.\d+)/)[1];
  }
  
  return { name: browser, version, userAgent: ua };
}

/**
 * Check for WebGL support
 * @returns {boolean} Whether WebGL is supported
 */
function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

/**
 * Check for WebGL2 support
 * @returns {boolean} Whether WebGL2 is supported
 */
function hasWebGL2() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
  } catch (e) {
    return false;
  }
}

export default {
  debugLog,
  checkBrowserCompatibility,
  DEBUG_LEVELS
}; 