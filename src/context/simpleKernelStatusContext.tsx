import { NotebookPanel } from '@jupyterlab/notebook';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface SimpleKernelIdleWatcherContextValue {
  refreshCount: number;
  withIgnoredKernelUpdates: <T>(fn: () => Promise<T>) => Promise<T>;
}

const SimpleKernelIdleWatcherContext = createContext<SimpleKernelIdleWatcherContextValue>({
  refreshCount: 0,
  withIgnoredKernelUpdates: async (fn) => fn(),
});

interface SimpleKernelIdleWatcherContextProviderProps {
  children: React.ReactNode;
  notebookPanel?: NotebookPanel | null; 
}

export const SimpleKernelIdleWatcherContextProvider: React.FC<SimpleKernelIdleWatcherContextProviderProps> = ({
  children,
  notebookPanel
}) => {
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const prevStatus = useRef<string | null>(null);
  const ignoreKernelUpdatesRef = useRef<boolean>(false);

  useEffect(() => {
    if (!notebookPanel) {
      console.log('Brak notebookPanel');
      return;
    }

    const kernel = notebookPanel.sessionContext.session?.kernel;
    if (!kernel) {
      console.log('Brak kernel');
      return;
    }

    const onKernelStatusChange = (_sender: any, status: string) => {
      if (ignoreKernelUpdatesRef.current) {
        return;
      }
      if (status === 'idle' && prevStatus.current !== 'idle') {
        setRefreshCount(prev => prev + 1);
      }
      prevStatus.current = status;
    };

    kernel.statusChanged.connect(onKernelStatusChange);

    return () => {
      kernel.statusChanged.disconnect(onKernelStatusChange);
    };
  }, [notebookPanel?.sessionContext?.session?.kernel, notebookPanel]);

  const withIgnoredKernelUpdates = async <T,>(fn: () => Promise<T>): Promise<T> => {
    ignoreKernelUpdatesRef.current = true;
    try {
      return await fn();
    } finally {
      ignoreKernelUpdatesRef.current = false;
    }
  };

  return (
    <SimpleKernelIdleWatcherContext.Provider value={{ refreshCount, withIgnoredKernelUpdates }}>
      {children}
    </SimpleKernelIdleWatcherContext.Provider>
  );
};

export const useSimpleKernelIdleWatcherContext = () =>
  useContext(SimpleKernelIdleWatcherContext);
