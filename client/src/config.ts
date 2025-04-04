// Environment-specific configuration
interface Config {
  apiUrl: string;
  // Add other environment-specific variables here
}

const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4100/api',
};

export default config; 