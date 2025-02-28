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

export enum StorageTypes {
  LocalStorage = "localStorage",
  SessionStorage = "sessionStorage",
  IndexedDB = "indexedDB",
}

export type StorageType =
  | StorageTypes.LocalStorage
  | StorageTypes.SessionStorage
  | StorageTypes.IndexedDB;

export enum NetWorkClient {
  Fetch = "fetch",
  XHR = "xhr",
}

export interface ErrorFluxState {
  dbName: string;
  stores: {
    networkLogs: string;
    consoleErrors: string;
    unhandledErrors: string;
  };
  pattern: string | RegExp;
  allowOnlyNetworkErrors: boolean;
  storageType: StorageType;
}

export interface NetworkLogDB {
  id: string;
  logs: NetworkLog;
}

export interface ConsoleErrorDB {
  id: string;
  errors: any[];
}

export interface UnhandledErrorDB {
  id: string;
  errors: any[];
}

export interface Stores {
  consoleErrors: string;
  networkLogs: string;
  unhandledErrors: string;
}
