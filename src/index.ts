import errorFluxNetworkInterceptor from "./interceptors/network";

export default function initErrorFlux({
  pattern,
}: {
  pattern: string | RegExp;
}) {
  const { getLogs: getNetworkLogs, clearLogs: clearNetworkLogs } =
    errorFluxNetworkInterceptor({ pattern });

  return {
    getNetworkLogs,
    clearNetworkLogs,
  };
}
