/**
 * Utilities for detecting the application environment
 */

/**
 * Get information about the current environment
 */
export const getEnvironmentInfo = () => {
  return {
    isWeb: true,
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,
  };
};
