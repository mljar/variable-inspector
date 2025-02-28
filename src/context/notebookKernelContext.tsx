import React, { createContext, useContext, useEffect, useState } from 'react';
import { NotebookWatcher, KernelInfo } from '../watchers/notebookWatcher';

type NotebookKernelContextType = KernelInfo | null;

const NotebookKernelContext = createContext<NotebookKernelContextType>(null);

export function useNotebookKernelContext(): NotebookKernelContextType {
  return useContext(NotebookKernelContext);
}

type NotebookKernelContextProviderProps = {
  children: React.ReactNode;
  notebookWatcher: NotebookWatcher;
};

export function NotebookKernelContextProvider({
  children,
  notebookWatcher
}: NotebookKernelContextProviderProps) {
  const [kernelInfo, setKernelInfo] = useState<KernelInfo | null>(
    notebookWatcher.kernelInfo
  );

  useEffect(() => {
    const onKernelChanged = (
      sender: NotebookWatcher,
      newKernelInfo: KernelInfo | null
    ) => {
      setKernelInfo(newKernelInfo);
    };

    notebookWatcher.kernelChanged.connect(onKernelChanged);

    setKernelInfo(notebookWatcher.kernelInfo);

    return () => {
      notebookWatcher.kernelChanged.disconnect(onKernelChanged);
    };
  }, [notebookWatcher]);

  return (
    <NotebookKernelContext.Provider value={kernelInfo}>
      {children}
    </NotebookKernelContext.Provider>
  );
}
