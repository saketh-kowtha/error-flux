// Global state store for ErrorFlux
// This is a simple state management solution for vanilla JS

import { ErrorFluxState, StorageTypes } from "../types";

const defaultState: ErrorFluxState = {
  dbName: "ErrorFluxDB",
  stores: {
    networkLogs: "networkLogs",
    consoleErrors: "consoleErrors",
    unhandledErrors: "unhandledErrors",
  },
  pattern: ".*",
  allowOnlyNetworkErrors: true,
  storageType: StorageTypes.IndexedDB,
};

class ErrorFluxStore {
  private state: ErrorFluxState;
  private listeners: Array<(state: ErrorFluxState) => void> = [];

  constructor(initialState?: Partial<ErrorFluxState>) {
    this.state = {
      ...defaultState,
      ...initialState,
    };
  }

  getState(): ErrorFluxState {
    return { ...this.state };
  }

  setState(newState: Partial<ErrorFluxState>): void {
    this.state = {
      ...this.state,
      ...newState,
    };
    this.notifyListeners();
  }

  subscribe(listener: (state: ErrorFluxState) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }
}

// Create and export a singleton instance
const store = new ErrorFluxStore();
export default store;
