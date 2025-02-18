import { NetworkLog } from "../types";
import genUUID from "../utils/gen-uuid";

interface NetworkLogDB {
  id: string;
  logs: NetworkLog[];
}

interface ConsoleErrorDB {
  id: string;
  errors: any[];
}

interface UnhandledErrorDB {
  id: string;
  errors: any[];
}

export class IndexedDBManager {
  private dbName: string;
  private dbVersion = 1;
  private stores: Record<string, string>;

  constructor(
    dbName: string,
    stores: Record<"consoleErrors" | "networkLogs" | "unhandledErrors", string>
  ) {
    this.dbName = dbName;
    this.stores = stores;
  }

  async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error("Failed to open database"));
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        Object.values(this.stores).forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: "id" });
          }
        });
      };
    });
  }

  async saveNetworkLogs(logs: NetworkLog[]): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [this.stores.networkLogs],
        "readwrite"
      );
      const store = transaction.objectStore(this.stores.networkLogs);

      const logEntry: NetworkLogDB = {
        id: genUUID(),
        logs,
      };

      const request = store.add(logEntry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to save logs"));
    });
  }

  async getNetworkLogs(): Promise<NetworkLogDB[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.stores.networkLogs], "readonly");
      const store = transaction.objectStore(this.stores.networkLogs);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error("Failed to retrieve logs"));
    });
  }

  async saveConsoleErrors(errors: any[]): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [this.stores.consoleErrors],
        "readwrite"
      );
      const store = transaction.objectStore(this.stores.consoleErrors);

      const errorEntry: ConsoleErrorDB = {
        id: genUUID(),
        errors,
      };

      const request = store.add(errorEntry);

      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error("Failed to save console errors"));
    });
  }

  async getConsoleErrors(): Promise<ConsoleErrorDB[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [this.stores.consoleErrors],
        "readonly"
      );
      const store = transaction.objectStore(this.stores.consoleErrors);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(new Error("Failed to retrieve console errors"));
    });
  }

  async saveUnhandledErrors(errors: any[]): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [this.stores.unhandledErrors],
        "readwrite"
      );
      const store = transaction.objectStore(this.stores.unhandledErrors);

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

  async getUnhandledErrors(): Promise<UnhandledErrorDB[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [this.stores.unhandledErrors],
        "readonly"
      );
      const store = transaction.objectStore(this.stores.unhandledErrors);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(new Error("Failed to retrieve unhandled errors"));
    });
  }
}
