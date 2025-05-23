import { parsePrescriberResponse } from "./parser";
import { PrescriberDetails } from "./types";
// import testHtml from './SampleResponse.html?raw';

// Get the proxy URL from the environment or fall back to a relative path for development
const PROXY_URL = import.meta.env.VITE_DEA_PROXY_URL;

interface ProxyResponse {
  status: 'queued' | 'in-progress' | 'complete';
  message: string;
  requestId: string;
  error?: string;
}

export class Client {
  private _cookie: string;
  private _testing: boolean;
  private _maxRetries: number;
  private _retryInterval: number;
  private _maxWaitTime: number;

  constructor(
    cookie: string,
    testing: boolean = false,
    retryInterval: number = 3000,
    maxWaitTime: number = 60000
  ) {
    this._cookie = cookie;
    this._testing = testing;
    this._maxRetries = maxWaitTime / retryInterval;
    this._retryInterval = retryInterval;
    this._maxWaitTime = maxWaitTime;
  }

  async getDeaHtml(dea: string): Promise<string> {
    if (this._testing) {
      console.info('Running in Test mode');
      // return testHtml;
    }

    const startTime = Date.now();
    let retryCount = 0;

    while (retryCount < this._maxRetries) {
      // Check if we've exceeded the maximum wait time
      if (Date.now() - startTime > this._maxWaitTime) {
        throw new Error(`Request timed out after ${this._maxWaitTime}ms`);
      }

      try {
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

        if (response.status === 200) {
          // Request is complete, return the HTML
          const html = await response.text();
          console.info(`DEA lookup completed successfully after ${retryCount} retries`);
          return html;
        } else if (response.status === 202) {
          // Request is still processing, parse the status response
          const statusResponse: ProxyResponse = await response.json() as ProxyResponse;
          console.info(`Request ${statusResponse.requestId} is ${statusResponse.status}. Retry ${retryCount + 1}/${this._maxRetries}`);

          // Wait before retrying
          await this.sleep(this._retryInterval);
          retryCount++;
        } else {
          // Handle other error statuses
          const statusResponse: ProxyResponse = await response.json() as ProxyResponse;
          let errorMessage = statusResponse.error || statusResponse.message || 'Unknown error';

          throw new Error(`Error fetching DEA data: ${response.status} - ${errorMessage}`);
        }
      } catch (error) {
        // If it's a network error or fetch fails, we should retry
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.warn(`Network error on attempt ${retryCount + 1}, retrying...`, error.message);
          await this.sleep(this._retryInterval);
          retryCount++;
        } else {
          // For other errors (like our custom errors above), don't retry
          console.error('Error in DEA lookup:', error);
          throw error;
        }
      }
    }

    throw new Error(`Request failed after ${this._maxRetries} retries`);
  }

  parseHtml(html: string): PrescriberDetails {
    return parsePrescriberResponse(html);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
