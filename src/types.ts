export interface NetworkLog {
  id: string;
  type: "fetch" | "xhr";
  url: string;
  method: string;
  requestHeaders?: Record<string, string>;
  requestBody: any;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  status?: number;
  duration: number;
  success: boolean;
  error?: string;
  cookies?: string;
}

export enum NetWorkClient {
  Fetch = "fetch",
  XHR = "xhr",
}
