import { parsePrescriberResponse } from "./parser";
import { PrescriberDetails } from "./types";

// Get the proxy URL from the environment or fall back to a relative path for development
const PROXY_URL = import.meta.env.VITE_DEA_PROXY_URL;

export class Client {
  private _cookie: string;
  private _testing: boolean;

  constructor(cookie: string, testing: boolean = false) {
    this._cookie = cookie;
    this._testing = testing;
  }

  async getDeaHtml(dea: string) {
    if (this._testing) {
      console.info('Running in Test mode');
      try {
        // Dynamically import only when testing is true
        const testHtmlModule = await import('./SampleResponse.html?raw');
        return testHtmlModule.default;
      } catch {
        console.warn('Test file not available, falling back to mock data');
        // Fallback in case the file isn't available
        return `<html><body><div id="SlnDetailTable"><div>Mock test data</div></div></body></html>`;
      }
    }

    try {
      // Use the proxy service
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cookie: this._cookie,
          dea: dea
        })
      });

      if (!response.ok) {
        throw new Error(`Error fetching DEA data: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error('Error in DEA lookup:', error);
      throw error;
    }
  }

  parseHtml(html: string): PrescriberDetails {
    return parsePrescriberResponse(html);
  }

}
