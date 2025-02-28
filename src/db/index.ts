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
  storeName: Stores,
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

      Object.values(storeName).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      });
    };
  });
}

export async function saveNetworkLogs(logs: NetworkLog): Promise<void> {
  const { dbName, storeName } = store.getState();
  const db = await initDB(dbName, storeName);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName.networkLogs], "readwrite");
    const store = transaction.objectStore(storeName.networkLogs);

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
  const { dbName, storeName } = store.getState();
  const db = await initDB(dbName, storeName);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName.networkLogs], "readonly");
    const store = transaction.objectStore(storeName.networkLogs);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Failed to retrieve logs"));
  });
}

export async function saveConsoleErrors(errors: any[]): Promise<void> {
  const { dbName, storeName } = store.getState();
  const db = await initDB(dbName, storeName);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName.consoleErrors], "readwrite");
    const store = transaction.objectStore(storeName.consoleErrors);

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
  const { dbName, storeName } = store.getState();
  const db = await initDB(dbName, storeName);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName.consoleErrors], "readonly");
    const store = transaction.objectStore(storeName.consoleErrors);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Failed to retrieve console errors"));
  });
}

export async function saveUnhandledErrors(errors: any[]): Promise<void> {
  const { dbName, storeName } = store.getState();
  const db = await initDB(dbName, storeName);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [storeName.unhandledErrors],
      "readwrite"
    );
    const store = transaction.objectStore(storeName.unhandledErrors);

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
  const { dbName, storeName } = store.getState();
  const db = await initDB(dbName, storeName);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName.unhandledErrors], "readonly");
    const store = transaction.objectStore(storeName.unhandledErrors);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Failed to retrieve unhandled errors"));
  });
}
