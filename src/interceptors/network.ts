/**
 * ErrorFlux Network Interceptor (MonkeyPatch Approach)
 * Captures all XHR & Fetch calls, logging success & error cases.
 */

import { nanoid } from "../../node_modules/nanoid/index";
import { NetworkLog } from "../types";

function getAllResponseHeaders(xhr: XMLHttpRequest): Record<string, string> {
  const headers = {};
  const headerPairs = xhr.getAllResponseHeaders().trim().split("\n");
  for (let i = 0; i < headerPairs.length; i++) {
    const headerPair = headerPairs[i].trim().split(": ");
    const key = headerPair[0];
    const value = headerPair[1];
    (headers as Record<string, string>)[key] = value;
  }
  return headers as Record<string, string>;
}

const errorFluxNetworkInterceptor = () => {
  const originalFetch = window.fetch;
  const originalXHR = window.XMLHttpRequest;
  const logs: NetworkLog[] = [];

  // Utility to generate unique request IDs
  function generateRequestId(): string {
    return nanoid();
  }

  /**
   * MonkeyPatch Fetch API
   */
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const requestId = generateRequestId();
    const startTime = performance.now();

    return originalFetch(input, init)
      .then(async (response) => {
        const clonedResponse = response.clone();
        const responseData = await clonedResponse.text();

        logs.push({
          id: requestId,
          type: "fetch",
          url: typeof input === "string" ? input : input.toString(),
          method: init?.method || "GET",
          requestHeaders: init?.headers
            ? Object.fromEntries(new Headers(init.headers).entries())
            : {},
          requestBody: init?.body || null,
          responseHeaders: Object.fromEntries(clonedResponse.headers.entries()),
          responseBody: responseData,
          status: clonedResponse.status,
          duration: performance.now() - startTime,
          success: clonedResponse.ok,
          cookies: document.cookie,
        });

        return response;
      })
      .catch((error: Error) => {
        // For fetch API, we can determine network errors (status 0) vs HTTP errors (400-500)
        const status =
          error instanceof TypeError
            ? 0
            : (error as any).status ||
              ((error as any).response && (error as any).response.status) ||
              500;

        logs.push({
          id: requestId,
          type: "fetch",
          url: typeof input === "string" ? input : input.toString(),
          method: init?.method || "GET",
          error: error.message,
          duration: performance.now() - startTime,
          success: false,
          requestBody: null,
          status: status, // Actual HTTP error status or 500 as fallback
          cookies: document.cookie,
        });
        throw error;
      });
  };

  /**
   * MonkeyPatch XMLHttpRequest
   */
  class InterceptedXHR extends originalXHR {
    private requestId: string;
    private startTime: number | null;
    private _url: string;
    private _method: string;
    private _error: string | null;

    constructor() {
      super();
      this.requestId = generateRequestId();
      this.startTime = null;
      this._url = "";
      this._method = "";
      this._error = null;
    }

    open(method: string, url: string, ...args: any[]) {
      this._method = method;
      this._url = url;
      // @ts-ignore
      super.open(method, url, ...(args as any));
    }

    send(body: Document | XMLHttpRequestBodyInit | null) {
      this.startTime = performance.now();
      this.addEventListener("loadend", () => {
        logs.push({
          id: this.requestId,
          type: "xhr",
          url: this._url,
          method: this._method,
          requestBody: body || null,
          responseHeaders: getAllResponseHeaders(this),
          responseBody: this.responseText,
          status: this.status,
          duration: performance.now() - (this.startTime as number),
          success: this.status >= 200 && this.status < 300,
          cookies: document.cookie,
        });
      });

      this.addEventListener("error", () => {
        logs.push({
          id: this.requestId,
          type: "xhr",
          url: this._url,
          method: this._method,
          error: "Network error",
          duration: performance.now() - (this.startTime as number),
          success: false,
          requestBody: null,
          cookies: document.cookie,
          status: this.status,
        });
      });

      super.send(body);
    }
  }

  window.XMLHttpRequest = InterceptedXHR;

  return {
    getLogs: () => logs,
    clearLogs: () => (logs.length = 0),
  };
};

export default errorFluxNetworkInterceptor;
