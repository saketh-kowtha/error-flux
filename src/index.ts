import errorFluxNetworkInterceptor from "./interceptors/network";

export default function initErrorFlux() {
  const { getLogs: getNetworkLogs, clearLogs: clearNetworkLogs } =
    errorFluxNetworkInterceptor();

  return {
    getNetworkLogs,
    clearNetworkLogs,
  };
}
