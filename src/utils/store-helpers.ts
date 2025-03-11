import store from "../state/store";

export const getStoreNames = () => {
  return store.getState().storeName;
};

export const getNetworkStoreName = () => {
  return store.getState().storeName.networkLogs;
};

export const getConsoleErrorStoreName = () => {
  return store.getState().storeName.consoleErrors;
};

export const getUnhandledErrorStoreName = () => {
  return store.getState().storeName.unhandledErrors;
};

export const getDbName = () => {
  return store.getState().dbName;
};
