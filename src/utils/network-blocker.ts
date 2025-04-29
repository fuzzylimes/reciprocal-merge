/**
 * This utility actively blocks all network requests from the application
 * to ensure no data is ever sent over the network, except for explicitly allowed domains.
 */

export function enableNetworkBlocker(allowedDomains: string[] = []) {
  // Convert the array to a Set for faster lookups
  const allowlist = new Set(allowedDomains);

  // Monkey patch fetch to prevent network requests
  const originalFetch = window.fetch;
  window.fetch = function blockedFetch(input: RequestInfo | URL, init?: RequestInit) {
    // Get the URL as a string
    const url = input instanceof Request ? input.url : input.toString();

    // Allow requests to get application assets during initial load
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith(window.location.origin)) {
      return originalFetch(input, init);
    }

    // Allow domains in the allowlist
    try {
      const urlObj = new URL(url);
      if (allowlist.has(urlObj.hostname)) {
        console.info('Allowed network request to:', urlObj.hostname);
        return originalFetch(input, init);
      }
    } catch {
      console.info(`request to ${url} is blocked.`)
    }

    // Block all other fetch requests
    console.warn('Network request blocked:', url);
    return Promise.reject(new Error('Network requests are disabled in offline mode'));
  };

  // Monkey patch XMLHttpRequest
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function blockedOpen(method: string, url: string | URL, async: boolean = false, username?: string | null, password?: string | null) {
    // Allow requests to get application assets during initial load
    const urlString = url.toString();
    if (urlString.startsWith('/') || urlString.startsWith('./') || urlString.startsWith(window.location.origin)) {
      return originalXhrOpen.call(this, method, url, async, username, password);
    }

    // Allow domains in the allowlist
    try {
      const urlObj = new URL(urlString);
      if (allowlist.has(urlObj.hostname)) {
        console.info('Allowed XMLHttpRequest to:', urlObj.hostname);
        return originalXhrOpen.call(this, method, url, async, username, password);
      }
    } catch {
      console.info(`request to ${url} is blocked.`)
    }

    // Block all other XHR requests
    console.warn('XMLHttpRequest blocked:', url);
    throw new Error('Network requests are disabled in offline mode');
  };

  // Block beacon API
  if ('sendBeacon' in navigator) {
    navigator.sendBeacon = function blockedBeacon(url: string | URL) {
      const urlString = url.toString();
      // Allow domains in the allowlist
      try {
        const urlObj = new URL(urlString);
        if (allowlist.has(urlObj.hostname)) {
          console.info('Allowed beacon to:', urlObj.hostname);
          // No good way to call original function here
          return true;
        }
      } catch {
        console.info(`request to ${url} is blocked.`)
      }

      console.warn('Beacon request blocked:', url);
      return false;
    };
  }

  console.info('Network blocker enabled - External requests are blocked except for:',
    allowedDomains.length ? allowedDomains.join(', ') : 'None');
  return true;
}
