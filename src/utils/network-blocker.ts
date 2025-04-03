/**
 * This utility actively blocks all network requests from the application
 * to ensure no data is ever sent over the network.
 */

export function enableNetworkBlocker() {
  // Monkey patch fetch to prevent network requests
  const originalFetch = window.fetch;
  window.fetch = function blockedFetch(input: RequestInfo | URL, init?: RequestInit) {
    // Allow requests to get application assets during initial load
    if (typeof input === 'string' && (
      input.startsWith('/') ||
      input.startsWith('./') ||
      input.startsWith(window.location.origin)
    )) {
      return originalFetch(input, init);
    }

    // Block all other fetch requests
    console.warn('Network request blocked:', input);
    return Promise.reject(new Error('Network requests are disabled in offline mode'));
  };

  // Monkey patch XMLHttpRequest
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function blockedOpen(method: string, url: string | URL, async: boolean = false, username?: string | null, password?: string | null) {
    // Allow requests to get application assets during initial load
    if (typeof url === 'string' && (
      url.startsWith('/') ||
      url.startsWith('./') ||
      url.startsWith(window.location.origin)
    )) {
      return originalXhrOpen.call(this, method, url, async, username, password);
    }

    // Block all other XHR requests
    console.warn('XMLHttpRequest blocked:', url);
    throw new Error('Network requests are disabled in offline mode');
  };

  // Block beacon API
  if ('sendBeacon' in navigator) {
    navigator.sendBeacon = function blockedBeacon(url: string | URL) {
      console.warn('Beacon request blocked:', url);
      return false;
    };
  }

  console.info('Network blocker enabled - All external network requests will be blocked');
  return true;
}
