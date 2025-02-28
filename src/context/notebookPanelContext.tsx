import React, { createContext, useContext, useEffect, useState } from 'react';
import { NotebookPanel } from '@jupyterlab/notebook';
import { NotebookWatcher } from '../watchers/notebookWatcher';

type NotebookPanelContextType = NotebookPanel | null;

const NotebookPanelContext = createContext<NotebookPanelContextType>(null);

export function useNotebookPanelContext(): NotebookPanelContextType {
  return useContext(NotebookPanelContext);
}

type NotebookPanelContextProviderProps = {
  children: React.ReactNode;
  notebookWatcher: NotebookWatcher;
};

export function NotebookPanelContextProvider({
  children,
  notebookWatcher
}: NotebookPanelContextProviderProps) {
  const [notebookPanel, setNotebookPanel] = useState<NotebookPanel | null>(
    notebookWatcher.notebookPanel()
  );

  useEffect(() => {
    const onNotebookPanelChange = (
      sender: NotebookWatcher,
      newNotebookPanel: NotebookPanel | null
    ) => {
      setNotebookPanel(newNotebookPanel);
    };

    notebookWatcher.notebookPanelChanged.connect(onNotebookPanelChange);

    setNotebookPanel(notebookWatcher.notebookPanel());

    return () => {
      notebookWatcher.notebookPanelChanged.disconnect(onNotebookPanelChange);
    };
  }, [notebookWatcher]);

  return (
    <NotebookPanelContext.Provider value={notebookPanel}>
      {children}
    </NotebookPanelContext.Provider>
  );
}
