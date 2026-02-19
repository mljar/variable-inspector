import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import { useNotebookPanelContext } from './notebookPanelContext';
import { useVariableContext } from './notebookVariableContext';
import { VARIABLE_INSPECTOR_ID, autoRefreshProperty } from '../index';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { NotebookActions } from '@jupyterlab/notebook';
import { resetVariableInspectorSubshell } from '../utils/variableInspectorSubshell';

interface ICodeExecutionContext {}

interface ICodeExecutionContextProviderProps {
  children: ReactNode;
  settingRegistry: ISettingRegistry | null;
}

const CodeExecutionContext = createContext<ICodeExecutionContext | undefined>(
  undefined
);

export const CodeExecutionContextProvider: React.FC<
  ICodeExecutionContextProviderProps
> = ({ children, settingRegistry }) => {
  const notebook = useNotebookPanelContext();
  const { refreshVariables, resetVariables } = useVariableContext();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadAutoRefresh = () => {
    if (settingRegistry) {
      settingRegistry
        .load(VARIABLE_INSPECTOR_ID)
        .then(settings => {
          const updateSettings = (): void => {
            const loadAutoRefresh = settings.get(autoRefreshProperty)
              .composite as boolean;
            setAutoRefresh(loadAutoRefresh);
          };
          updateSettings();
          settings.changed.connect(updateSettings);
        })
        .catch(reason => {
          console.error('Failed to load settings for Your Variables', reason);
        });
    }
  };

  useEffect(() => {
    loadAutoRefresh();
  }, []);

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
    if (!notebook || !autoRefresh) {
      return;
    }

    const onCellExecuted = (
      _sender: any,
      args: { cell: any; notebook: any }
    ) => {
      refreshVariables();
    };

    NotebookActions.executed.connect(onCellExecuted);

    return () => {
      NotebookActions.executed.disconnect(onCellExecuted);
    };
  }, [notebook, refreshVariables, autoRefresh]);

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
