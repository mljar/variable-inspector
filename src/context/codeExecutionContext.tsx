import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useNotebookPanelContext } from './notebookPanelContext';
import { useVariableContext } from './notebookVariableContext';
import { resetVariableInspectorSubshell } from '../utils/variableInspectorSubshell';
import { notebookExecutionRefreshCoordinator } from '../services/notebookExecutionRefreshCoordinator';

interface ICodeExecutionContext {}

interface ICodeExecutionContextProviderProps {
  children: ReactNode;
}

const CodeExecutionContext = createContext<ICodeExecutionContext | undefined>(
  undefined
);

export const CodeExecutionContextProvider: React.FC<
  ICodeExecutionContextProviderProps
> = ({ children }) => {
  const notebook = useNotebookPanelContext();
  const { refreshVariables, resetVariables } = useVariableContext();

  useEffect(() => {
    if (!notebook) {
      return;
    }

    const sessionContext = notebook.context.sessionContext;
    if (!sessionContext) {
      return;
    }

    const handleRestart = (_sender: any, status: string) => {
      if (status === 'restarting') {
        resetVariableInspectorSubshell();
        resetVariables();
      }
    };

    sessionContext.statusChanged.connect(handleRestart);

    return () => {
      sessionContext.statusChanged.disconnect(handleRestart);
    };
  }, [notebook, resetVariables]);

  useEffect(() => {
    if (!notebook) {
      return;
    }
    return notebookExecutionRefreshCoordinator.subscribe(
      notebook,
      refreshVariables
    );
  }, [notebook, refreshVariables]);

  return (
    <CodeExecutionContext.Provider value={{}}>
      {children}
    </CodeExecutionContext.Provider>
  );
};

export const useCodeExecutionContext = (): ICodeExecutionContext => {
  const context = useContext(CodeExecutionContext);
  if (!context) {
    throw new Error(
      'useCodeExecutionContext must be used CodeExecutionContextProvider'
    );
  }
  return context;
};
