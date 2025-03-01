import { StorageTypes } from "./../types";
import { saveUnhandledErrors, saveConsoleErrors } from "../db/index";
import store from "../state/store";
import genUUID from "../utils/gen-uuid";
import { runLowPriorityTask } from "../utils/low-priority";

const errorLogs = {
  async saveError(storeName: string, errors: any[]) {
    runLowPriorityTask(async () => {
      const { dbName, storageType } = store.getState();
      switch (storageType) {
        case StorageTypes.LocalStorage:
          try {
            const dbData = JSON.parse(localStorage.getItem(dbName) || "{}");
            const existingErrors = dbData[storeName] || [];
            existingErrors.push({
              id: genUUID(),
              errors,
              timestamp: new Date().toISOString(),
            });
            dbData[storeName] = existingErrors;
            localStorage.setItem(dbName, JSON.stringify(dbData));
          } catch (err) {
            console.warn("Failed to save to localStorage:", err);
          }
          break;

        case StorageTypes.SessionStorage:
          try {
            const dbData = JSON.parse(sessionStorage.getItem(dbName) || "{}");
            const existingErrors = dbData[storeName] || [];
            existingErrors.push({
              id: genUUID(),
              errors,
              timestamp: new Date().toISOString(),
            });
            dbData[storeName] = existingErrors;
            sessionStorage.setItem(dbName, JSON.stringify(dbData));
          } catch (err) {
            console.warn("Failed to save to sessionStorage:", err);
          }
          break;
        case StorageTypes.IndexedDB:
          if (storeName === store.getState().storeName.consoleErrors) {
            await saveConsoleErrors(errors);
          } else if (storeName === store.getState().storeName.unhandledErrors) {
            await saveUnhandledErrors(errors);
          }
          break;
      }
    });
  },
};

const errorFluxGlobalErrorInterceptor = ({
  handleOnError,
  handleOnUnhandledRejection,
}: Partial<{
  handleOnError: boolean;
  handleOnUnhandledRejection: boolean;
}>) => {
  if (handleOnError)
    window.onerror = function (message, source, lineno, colno, error) {
      const errorData = [
        {
          type: "synchronous",
          message,
          source,
          lineno,
          colno,
          stack: error?.stack || String(error),
          timestamp: new Date().toISOString(),
        },
      ];

      errorLogs.saveError(store.getState().storeName.consoleErrors, errorData);
    };

  if (handleOnUnhandledRejection)
    window.addEventListener("unhandledrejection", function (event) {
      const errorData = [
        {
          type: "promise",
          message: event.reason?.message || "Unhandled Promise Rejection",
          source: event.reason?.fileName || "unknown",
          lineno: event.reason?.lineNumber || 0,
          colno: event.reason?.columnNumber || 0,
          stack: event.reason?.stack || String(event.reason),
          timestamp: new Date().toISOString(),
        },
      ];

      errorLogs.saveError(
        store.getState().storeName.unhandledErrors,
        errorData
      );
    });

  const getLogs = () => {
    const { storeName: storeNameObj, dbName, storageType } = store.getState();
    const consoleErrorsStoreName = storeNameObj.consoleErrors;
    const unhandledErrorsStoreName = storeNameObj.unhandledErrors;

    const getConsoleErrors = async () => {
      switch (storageType) {
        case StorageTypes.IndexedDB:
          return await getConsoleErrors();
        case StorageTypes.LocalStorage:
          return (
            JSON.parse(localStorage.getItem(dbName) || "{}")?.[
              consoleErrorsStoreName
            ] || []
          );
        case StorageTypes.SessionStorage:
          return (
            JSON.parse(sessionStorage.getItem(dbName) || "{}")?.[
              consoleErrorsStoreName
            ] || []
          );
        default:
          return [];
      }
    };

    const getUnhandledErrors = async () => {
      switch (storageType) {
        case StorageTypes.IndexedDB:
          return await getUnhandledErrors();
        case StorageTypes.LocalStorage:
          return (
            JSON.parse(localStorage.getItem(dbName) || "{}")?.[
              unhandledErrorsStoreName
            ] || []
          );
        case StorageTypes.SessionStorage:
          return (
            JSON.parse(sessionStorage.getItem(dbName) || "{}")?.[
              unhandledErrorsStoreName
            ] || []
          );
        default:
          return [];
      }
    };

    return {
      getConsoleErrors,
      getUnhandledErrors,
    };
  };

  return {
    getLogs,
  };
};

export default errorFluxGlobalErrorInterceptor;
