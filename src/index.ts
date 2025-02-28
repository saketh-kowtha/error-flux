import errorFluxGlobalErrorInterceptor from "./interceptors/global-error";
import errorFluxNetworkInterceptor from "./interceptors/network";
import store from "./state/store";
import { ErrorFluxState } from "./types";

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
    dbName: dbName || store.getState().dbName,
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

  errorFluxGlobalErrorInterceptor({
    handleOnError,
    handleOnUnhandledRejection,
  });

  return {
    getNetworkLogs,
  };
}
