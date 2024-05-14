import React, { createContext, useContext } from "react";

const TestnetContext = createContext(false);

export const useTestnetContext = () => {
  const context = useContext(TestnetContext);
  if (context === undefined) {
    throw new Error(
      "useTestnetContext must be used within a TestnetContextProvider"
    );
  }
  return context;
};

export const TestnetContextProvider = ({ children, testnet }) => {
  return (
    <TestnetContext.Provider value={testnet}>
      {children}
    </TestnetContext.Provider>
  );
};
