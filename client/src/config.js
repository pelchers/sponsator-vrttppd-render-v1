// Central configuration file for the application
const config = {
  // API URL from environment variable with fallback
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:4100/api',
  
  // Other configuration values can be added here
  APP_NAME: 'Sponsator',
  VERSION: '1.0.0',
};

export default config; 