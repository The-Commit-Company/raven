import React, { createContext, useContext, useState, ReactNode } from "react";
import UserInactivity from "react-native-user-inactivity";

interface ActiveUserContextType {
  isActive: boolean;
}

const ActiveUserContext = createContext<ActiveUserContextType | undefined>(
  undefined
);

interface ActiveUserProviderProps {
  children: ReactNode;
  inactivityTimeout?: number;
}

export const ActiveUserProvider = ({
  children,
  inactivityTimeout = 1000 * 60 * 10,
}: ActiveUserProviderProps) => {
  const [isActive, setIsActive] = useState<boolean>(true);

  const handleUserActivity = (active: boolean) => {
    setIsActive(active);
  };

  return (
    <ActiveUserContext.Provider value={{ isActive }}>
      <UserInactivity
        isActive={isActive}
        timeForInactivity={inactivityTimeout}
        onAction={handleUserActivity}
      >
        {children}
      </UserInactivity>
    </ActiveUserContext.Provider>
  );
};

export const useActiveUser = (): ActiveUserContextType => {
  const context = useContext(ActiveUserContext);
  if (context === undefined) {
    throw new Error("useActiveUser must be used within an ActiveUserProvider");
  }
  return context;
};
