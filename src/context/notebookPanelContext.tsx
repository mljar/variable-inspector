import React, { createContext, useContext, useEffect, useState } from 'react';
import { NotebookWatcher } from '../watchers/notebookWatcher';
import { NotebookLikeWidget } from '../utils/notebookTypes';

type NotebookPanelContextType = NotebookLikeWidget;

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
  const [notebookPanel, setNotebookPanel] = useState<NotebookLikeWidget>(
    notebookWatcher.notebookPanel()
  );

  useEffect(() => {
    const onNotebookPanelChange = (
      sender: NotebookWatcher,
      newNotebookPanel: NotebookLikeWidget
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
