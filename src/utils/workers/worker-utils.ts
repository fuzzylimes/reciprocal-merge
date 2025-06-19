/**
 * Utility functions for working with Web Workers in the application
 */

/**
 * Checks if Web Workers are supported in the current environment
 */
export function isWorkerSupported(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * Creates a worker from a given file
 * Note: In Vite, workers need to be created with a special syntax for proper bundling
 */
export function createWorker(workerPath: string): Worker {
  // Remove leading slash if present
  const cleanPath = workerPath.startsWith('/') ? workerPath.substring(1) : workerPath;

  // Combine with base URL
  const fullPath = `${import.meta.env.BASE_URL}${cleanPath}`;
  return new Worker(fullPath, { type: 'module' });
}

/**
 * Terminates a worker if it exists
 */
export function terminateWorker(worker: Worker | null): void {
  if (worker) {
    worker.terminate();
  }
}
