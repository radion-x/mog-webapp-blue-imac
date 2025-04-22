import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Suppress certain console warnings and errors
if (process.env.NODE_ENV !== 'development') {
  // Suppress console errors in production mode
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Don't log source map related errors or certain React warnings
    const errorText = args[0]?.toString() || '';
    if (
      errorText.includes('source map') || 
      errorText.includes('Failed to parse') ||
      errorText.includes('@mediapipe') ||
      errorText.includes('Warning: validateDOMNesting')
    ) {
      return;
    }
    originalConsoleError(...args);
  };
}

// Suppress source map warnings in dev mode
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Don't log source map warnings
  const warnText = args[0]?.toString() || '';
  if (
    warnText.includes('source map') ||
    warnText.includes('@mediapipe')
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
