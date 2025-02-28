import errorFluxNetworkInterceptor from "./interceptors/network";
import store from "./state/store";
import { StorageType, Stores } from "./types";

export default function initErrorFlux({
  pattern,
  allowOnlyNetworkErrors = true,
  storeName,
  dbName,
  storageType,
}: {
  pattern: string | RegExp;
  allowOnlyNetworkErrors?: boolean;
  storeName?: Stores;
  dbName?: string;
  storageType?: StorageType;
}) {
  store.setState({
    dbName: dbName || store.getState().dbName,
    storageType: storageType || store.getState().storageType,
    stores: {
      ...store.getState().stores,
      ...(Object.keys(storeName || {}).length > 0 ? storeName : {}),
    },
  });

  const { getLogs: getNetworkLogs } = errorFluxNetworkInterceptor({
    pattern,
    onlyFailures: allowOnlyNetworkErrors,
  });

  return {
    getNetworkLogs,
  };
}
