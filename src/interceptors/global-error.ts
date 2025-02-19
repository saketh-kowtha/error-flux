window.onerror = function (message, source, lineno, colno, error) {
  console.log(`Synchronous Error: ${message} at ${source}:${lineno}:${colno}`);
};

window.addEventListener("unhandledrejection", function (event) {
  console.log(`Unhandled Rejection: ${event.reason}`);
});
