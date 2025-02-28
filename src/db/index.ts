import store from "../state/store";
import {
  ConsoleErrorDB,
  NetworkLog,
  NetworkLogDB,
  Stores,
  UnhandledErrorDB,
} from "../types";
import genUUID from "../utils/gen-uuid";

export async function initDB(
  dbName: string,
  stores: Stores,
  dbVersion: number = 1
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = () => {
      reject(new Error("Failed to open database"));
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      Object.values(stores).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      });
    };
  });
}

export async function saveNetworkLogs(logs: NetworkLog): Promise<void> {
  const { dbName, stores } = store.getState();
  const db = await initDB(dbName, stores);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([stores.networkLogs], "readwrite");
    const store = transaction.objectStore(stores.networkLogs);

    const logEntry: NetworkLogDB = {
      id: genUUID(),
      logs,
    };

    const request = store.add(logEntry);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to save logs"));
  });
}

export async function getNetworkLogs(): Promise<NetworkLogDB[]> {
  const { dbName, stores } = store.getState();
  const db = await initDB(dbName, stores);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([stores.networkLogs], "readonly");
    const store = transaction.objectStore(stores.networkLogs);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Failed to retrieve logs"));
  });
}

export async function saveConsoleErrors(errors: any[]): Promise<void> {
  const { dbName, stores } = store.getState();
  const db = await initDB(dbName, stores);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([stores.consoleErrors], "readwrite");
    const store = transaction.objectStore(stores.consoleErrors);

    const errorEntry: ConsoleErrorDB = {
      id: genUUID(),
      errors,
    };

    const request = store.add(errorEntry);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to save console errors"));
  });
}

export async function getConsoleErrors(): Promise<ConsoleErrorDB[]> {
  const { dbName, stores } = store.getState();
  const db = await initDB(dbName, stores);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([stores.consoleErrors], "readonly");
    const store = transaction.objectStore(stores.consoleErrors);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Failed to retrieve console errors"));
  });
}

export async function saveUnhandledErrors(errors: any[]): Promise<void> {
  const { dbName, stores } = store.getState();
  const db = await initDB(dbName, stores);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([stores.unhandledErrors], "readwrite");
    const store = transaction.objectStore(stores.unhandledErrors);

    const errorEntry: UnhandledErrorDB = {
      id: genUUID(),
      errors,
    };

    const request = store.add(errorEntry);

    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(new Error("Failed to save unhandled errors"));
  });
}

export async function getUnhandledErrors(): Promise<UnhandledErrorDB[]> {
  const { dbName, stores } = store.getState();
  const db = await initDB(dbName, stores);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([stores.unhandledErrors], "readonly");
    const store = transaction.objectStore(stores.unhandledErrors);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Failed to retrieve unhandled errors"));
  });
}
