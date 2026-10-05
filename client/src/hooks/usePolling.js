import { useEffect, useRef } from 'react';

/**
 * Robust polling hook for AgriLink:
 * 1. Pauses polling when document.visibilityState !== 'visible'
 * 2. Resumes polling when tab becomes visible
 * 3. Stops polling when enabled is false (inactive portal / tab)
 * 4. Prevents overlapping concurrent requests using isRunningRef
 * 5. Cleans up intervals cleanly on unmount
 * 6. Prevents duplicate intervals
 */
export function usePolling(asyncCallback, intervalMs, { enabled = true, runOnVisibleResume = false } = {}) {
  const savedCallback = useRef(asyncCallback);
  const isRunningRef = useRef(false);

  useEffect(() => {
    savedCallback.current = asyncCallback;
  }, [asyncCallback]);

  useEffect(() => {
    if (!enabled || !intervalMs || intervalMs <= 0) return;

    let timerId = null;

    const executePoll = async () => {
      if (document.visibilityState !== 'visible') return;
      if (isRunningRef.current) return; // Prevent overlapping requests

      isRunningRef.current = true;
      try {
        await savedCallback.current();
      } catch (err) {
        console.warn('Polling execution note:', err?.message || err);
      } finally {
        isRunningRef.current = false;
      }
    };

    const startTimer = () => {
      if (!timerId && document.visibilityState === 'visible') {
        timerId = setInterval(executePoll, intervalMs);
      }
    };

    const stopTimer = () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (runOnVisibleResume) {
          executePoll();
        }
        startTimer();
      } else {
        stopTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startTimer();

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, intervalMs, runOnVisibleResume]);
}

export default usePolling;
