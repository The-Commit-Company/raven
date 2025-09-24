import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { View, PanResponder, AppState, AppStateStatus } from "react-native";

interface ActiveUserContextType {
  isActive: boolean;
}

const ActiveUserContext = createContext<ActiveUserContextType | undefined>(
  undefined
);

interface ActiveUserProviderProps {
  children: React.ReactNode;
  inactivityTimeout?: number;
}

export const ActiveUserProvider = ({
  children,
  inactivityTimeout = 1000 * 60 * 10, // 10 minutes default
}: ActiveUserProviderProps) => {
  const [isActive, setIsActive] = useState<boolean>(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsActive(true);

    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, inactivityTimeout);
  };

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground, reset timer
        resetInactivityTimer();
      } else if (nextAppState.match(/inactive|background/)) {
        // App is going to background, mark as inactive
        setIsActive(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Initialize timer
    resetInactivityTimer();

    return () => {
      subscription.remove();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inactivityTimeout]);

  // PanResponder to detect touch events
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => {
      resetInactivityTimer();
      return false; // Don't capture the touch, let it pass through
    },
    onMoveShouldSetPanResponder: () => {
      resetInactivityTimer();
      return false;
    },
    onPanResponderGrant: () => {
      resetInactivityTimer();
    },
    onPanResponderMove: () => {
      resetInactivityTimer();
    },
    onPanResponderRelease: () => {
      resetInactivityTimer();
    },
  });

  return React.createElement(
    ActiveUserContext.Provider,
    { value: { isActive } },
    React.createElement(
      View,
      { style: { flex: 1 }, ...panResponder.panHandlers },
      children
    )
  );
};

export const useActiveUser = (): ActiveUserContextType => {
  const context = useContext(ActiveUserContext);
  if (context === undefined) {
    throw new Error("useActiveUser must be used within an ActiveUserProvider");
  }
  return context;
};
