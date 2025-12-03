import { useEffect, useRef, useCallback } from 'react';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
const LAST_ACTIVITY_KEY = 'lastActivityTimestamp';
const DEBOUNCE_DELAY = 1000; // Debounce activity updates to reduce localStorage writes

interface UseInactivityTimeoutProps {
  onTimeout: () => void;
  isAuthenticated: boolean;
}

export const useInactivityTimeout = ({ onTimeout, isAuthenticated }: UseInactivityTimeoutProps) => {
  const timeoutRef = useRef<number | null>(null);
  const debounceRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(0);

  // Update last activity timestamp in localStorage and ref (debounced)
  const updateActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;

    // Debounce localStorage writes to reduce overhead
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    }, DEBOUNCE_DELAY);
  }, []);

  // Reset the inactivity timer
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    updateActivity();

    // Set a new timeout
    timeoutRef.current = window.setTimeout(() => {
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
        window.clearTimeout(timeoutRef.current);
      }

      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
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
