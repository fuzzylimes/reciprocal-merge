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
  // When using Vite, we need to use the special ?worker syntax
  // This tells Vite to properly bundle the worker
  const workerUrl = new URL(workerPath, import.meta.url);
  return new Worker(workerUrl, { type: 'module' });
}

/**
 * Terminates a worker if it exists
 */
export function terminateWorker(worker: Worker | null): void {
  if (worker) {
    worker.terminate();
  }
}
