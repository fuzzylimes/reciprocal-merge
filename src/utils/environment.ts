/**
 * Utilities for detecting and handling the application environment
 * (Tauri desktop app vs. web browser)
 */

import { isTauri } from "@tauri-apps/api/core";

/**
 * Check if the application is running inside Tauri
 */
export const isTauriEnv = (): boolean => {
  // Check for Tauri global object
  return isTauri();
};

/**
 * Get information about the current environment
 */
export const getEnvironmentInfo = () => {
  return {
    isTauri: isTauriEnv(),
    isWeb: !isTauriEnv(),
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,
  };
};

/**
 * Log environment information to console (useful for debugging)
 */
export const logEnvironmentInfo = (): void => {
  const info = getEnvironmentInfo();
  console.info(
    '%c🔍 ENVIRONMENT INFO',
    'color: white; background: #1976d2; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
    `\nRunning in: ${info.isTauri ? 'Tauri Desktop App' : 'Web Browser'}\nMode: ${info.isProduction ? 'Production' : 'Development'}`
  );
};
