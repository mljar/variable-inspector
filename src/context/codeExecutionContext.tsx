import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import { KernelMessage } from '@jupyterlab/services';
import { IExecuteInputMsg } from '@jupyterlab/services/lib/kernel/messages';
import { useNotebookPanelContext } from './notebookPanelContext';
import { useNotebookKernelContext } from './notebookKernelContext';
import { useVariableContext } from './notebookVariableContext';
import { VARIABLE_INSPECTOR_ID, autoRefreshProperty } from '../index';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { variableDict } from '../python_code/getVariables';

interface ICodeExecutionContext {}

interface CodeExecutionContextProviderProps {
  children: ReactNode;
  settingRegistry: ISettingRegistry | null;
}

const CodeExecutionContext = createContext<ICodeExecutionContext | undefined>(
  undefined
);

export const CodeExecutionContextProvider: React.FC<
  CodeExecutionContextProviderProps
> = ({ children, settingRegistry }) => {
  const notebook = useNotebookPanelContext();
  const kernelReady = useNotebookKernelContext();
  const { refreshVariables } = useVariableContext();
  const getVariableCode = variableDict;
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
          console.error(
            'Failed to load settings for Variable Inspector',
            reason
          );
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
    const kernel = notebook.sessionContext?.session?.kernel;
    if (!kernel) {
      return;
    }
    const handleIOPubMessage = (sender: any, msg: KernelMessage.IMessage) => {
      if (msg.header.msg_type === 'execute_input') {
        const inputMsg = msg as IExecuteInputMsg;
        const code = inputMsg.content.code;
        const variableInspectorPrefix = '_jupyterlab_variableinspector';
        const mljarPrefix = '__mljar';
        if (
          code !== getVariableCode &&
          !code.includes(variableInspectorPrefix) &&
          !code.includes(mljarPrefix) &&
          autoRefresh
        ) {
          refreshVariables();
        }
      }
    };
    kernel.iopubMessage.connect(handleIOPubMessage);

    return () => {
      kernel.iopubMessage.disconnect(handleIOPubMessage);
    };
  }, [notebook, notebook?.sessionContext, kernelReady, autoRefresh]);

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
