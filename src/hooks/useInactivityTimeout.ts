import { useEffect, useRef, useCallback } from 'react';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
const LAST_ACTIVITY_KEY = 'lastActivityTimestamp';

interface UseInactivityTimeoutProps {
  onTimeout: () => void;
  isAuthenticated: boolean;
}

export const useInactivityTimeout = ({ onTimeout, isAuthenticated }: UseInactivityTimeoutProps) => {
  const timeoutRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(0);

  // Update last activity timestamp in localStorage and ref
  const updateActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
  }, []);

  // Reset the inactivity timer
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    updateActivity();

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, INACTIVITY_TIMEOUT);
  }, [onTimeout, updateActivity]);

  // Check if user has been inactive for too long on mount/reload
  useEffect(() => {
    if (!isAuthenticated) return;

    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);

    if (lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);

      // If more than 10 minutes have passed, sign out immediately
      if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
        onTimeout();
        return;
      }
    }

    // Initialize the timer
    resetTimer();

    // Activity event listeners
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, onTimeout, resetTimer]);

  // Clear activity data on sign out
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    }
  }, [isAuthenticated]);
};
