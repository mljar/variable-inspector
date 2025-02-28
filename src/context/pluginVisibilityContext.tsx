import React, { createContext, useState, useContext } from 'react';

export interface PluginVisibilityContextValue {
  isPluginOpen: boolean;
  setPluginOpen: (open: boolean) => void;
}

export const PluginVisibilityContext =
  createContext<PluginVisibilityContextValue>({
    isPluginOpen: false,
    setPluginOpen: () => { }
  });

export function PluginVisibilityProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [isPluginOpen, setPluginOpen] = useState(false);
  return (
    <PluginVisibilityContext.Provider value={{ isPluginOpen, setPluginOpen }}>
      {children}
    </PluginVisibilityContext.Provider>
  );
}

export function usePluginVisibility() {
  return useContext(PluginVisibilityContext);
}
