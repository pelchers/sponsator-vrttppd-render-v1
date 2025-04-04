// Environment-specific configuration
interface Config {
  apiUrl: string;
  // Add other environment-specific variables here
  isProduction: boolean;
}

const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4100/api',
  isProduction: import.meta.env.PROD || false,
};

// Log the environment
console.log('Running in', config.isProduction ? 'PRODUCTION' : 'DEVELOPMENT', 'mode');
console.log('API URL:', config.apiUrl);

export default config; 