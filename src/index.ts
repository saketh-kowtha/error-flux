import errorFluxGlobalErrorInterceptor from "./interceptors/global-error";
import errorFluxNetworkInterceptor from "./interceptors/network";
import store from "./state/store";
import { ErrorFluxState, StorageTypes } from "./types";
import { getDbName } from "./utils/store-helpers";

export default function initErrorFlux({
  pattern,
  allowOnlyNetworkErrors = true,
  storeName,
  dbName,
  storageType,
  handleOnError,
  handleOnUnhandledRejection,
}: ErrorFluxState) {
  store.setState({
    dbName: dbName || getDbName(),
    storageType: storageType || store.getState().storageType,
    storeName: {
      ...store.getState().storeName,
      ...(Object.keys(storeName || {}).length > 0 ? storeName : {}),
    },
  });

  const { getLogs: getNetworkLogs } = errorFluxNetworkInterceptor({
    pattern,
    onlyFailures: allowOnlyNetworkErrors,
  });

  const { getLogs: getErrorLogs } = errorFluxGlobalErrorInterceptor({
    handleOnError,
    handleOnUnhandledRejection,
  });

  return {
    getNetworkLogs,
    getErrorLogs,
  };
}

export { StorageTypes, ErrorFluxState };
