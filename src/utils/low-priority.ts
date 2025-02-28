/**
 * Executes a low-priority task in the background without affecting the main thread.
 * Uses requestIdleCallback when available, falling back to setTimeout for older browsers.
 *
 * @param callback - The function to execute as a low priority task
 * @param options - Optional configuration for the task execution
 * @param options.timeout - Maximum delay (in ms) before the callback must be invoked
 * @returns A function that can be called to cancel the scheduled task
 */
export function runLowPriorityTask(
  callback: () => void,
  options: { timeout?: number } = {}
): () => void {
  // Check if requestIdleCallback is available (modern browsers)
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    const idleCallbackId = window.requestIdleCallback(
      (deadline) => {
        // Check if we have enough time, or if we must run now due to timeout
        if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
          callback();
        } else {
          // Not enough time left in this idle period, reschedule
          runLowPriorityTask(callback, options);
        }
      },
      { timeout: options.timeout || 1000 } // Default timeout of 1 second
    );

    // Return function to cancel the task if needed
    return () => {
      window.cancelIdleCallback(idleCallbackId);
    };
  } else {
    // Fallback for browsers without requestIdleCallback
    const timeoutId = setTimeout(() => {
      callback();
    }, 0);

    // Return function to cancel the task if needed
    return () => {
      clearTimeout(timeoutId);
    };
  }
}
