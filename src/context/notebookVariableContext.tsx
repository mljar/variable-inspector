import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { useNotebookPanelContext } from './notebookPanelContext';
import { useNotebookKernelContext } from './notebookKernelContext';
import { KernelMessage } from '@jupyterlab/services';
import { IKernelData } from '@mljar/kernel-data';
import { variableDict } from '../python_code/getVariables';
import { provideVariableInspectorSubshellKernel } from '../utils/variableInspectorSubshell';
import { DebouncedTaskQueue } from '../utils/debouncedTaskQueue';

export interface IVariableInfo {
  name: string;
  type: string;
  shape: string;
  dimension: number;
  size: number;
  value: string;
}

interface IVariableContextProps {
  variables: IVariableInfo[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  refreshVariables: () => void;
  isRefreshing: boolean;
  refreshCount: number;
  resetVariables: () => void;
}

const VariableContext = createContext<IVariableContextProps | undefined>(
  undefined
);

export const VariableContextProvider: React.FC<{
  children: React.ReactNode;
  kernelData: IKernelData;
}> = ({ children, kernelData }) => {
  const notebookPanel = useNotebookPanelContext();
  const kernel = useNotebookKernelContext();
  const [variables, setVariables] = useState<IVariableInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const queueRef = useRef(new DebouncedTaskQueue(250));

  const activeRef = useRef(notebookPanel);
  activeRef.current = notebookPanel;
  const resetVariables = useCallback(() => {
    setVariables([]);
    setLoading(false);
    setIsRefreshing(false);
    setError(null);
  }, []);

  const executeCode = useCallback(async () => {
    if (!notebookPanel || activeRef.current !== notebookPanel) {
      return;
    }
    const session = notebookPanel.context.sessionContext;
    kernelData.track(session);
    await session.ready;
    const sourceKernel = session.session?.kernel;
    if (!sourceKernel) {
      resetVariables();
      return;
    }
    const request = kernelData.begin(sourceKernel.id, 'variables');
    const current = () =>
      activeRef.current === notebookPanel &&
      session.session?.kernel?.id === sourceKernel.id &&
      kernelData.current(request);
    setLoading(true);
    setError(null);
    try {
      const viKernel =
        await provideVariableInspectorSubshellKernel(sourceKernel);
      if (!current()) {
        return;
      }
      if (!viKernel) {
        throw new Error('No kernel available');
      }
      let received = false;
      const future = viKernel.requestExecute(
        { code: variableDict, store_history: false },
        true,
        { mljar_variable_inspector: true }
      );
      future.onIOPub = (msg: KernelMessage.IIOPubMessage) => {
        if (!current()) {
          return;
        }
        if (msg.header.msg_type === 'error') {
          kernelData.fail(request, 'Variable inspection failed');
          setError('Variable inspection failed');
          return;
        }
        if (
          ['execute_result', 'display_data', 'update_display_data'].includes(
            msg.header.msg_type
          )
        ) {
          const items = (msg.content as any)?.data?.['application/json'];
          if (!Array.isArray(items)) {
            return;
          }
          received = true;
          kernelData.publish(request, items);
          setVariables(
            items.map(item => ({
              name: item.varName,
              type: item.varType,
              shape: item.varShape || 'None',
              dimension: item.varDimension,
              size: item.varSize,
              value: item.varSimpleValue
            }))
          );
          setRefreshCount(prev => prev + 1);
        }
      };
      await future.done;
      if (current() && !received) {
        throw new Error('Kernel returned no variable snapshot');
      }
    } catch (err) {
      if (current()) {
        kernelData.fail(request, String(err));
        setError('Variable inspection failed');
      }
    } finally {
      if (current()) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [notebookPanel, kernel?.id, kernelData, resetVariables]);

  useEffect(() => {
    resetVariables();
    setSearchTerm('');
    if (!notebookPanel) {
      return;
    }
    const session = notebookPanel.context.sessionContext;
    kernelData.track(session);
    const statusChanged = (_: unknown, status: string) => {
      if (
        ['restarting', 'autorestarting', 'dead', 'terminating'].includes(status)
      ) {
        resetVariables();
      } else if (
        status === 'idle' &&
        kernelData.variables(session.session?.kernel?.id).status === 'unknown'
      ) {
        queueRef.current.add(executeCode);
      }
    };
    session.statusChanged.connect(statusChanged);
    queueRef.current.add(executeCode);
    return () => {
      session.statusChanged.disconnect(statusChanged);
      queueRef.current.cancel();
    };
  }, [notebookPanel, executeCode, kernelData, resetVariables]);

  const refreshVariables = useCallback(() => {
    queueRef.current.add(executeCode);
  }, [executeCode]);

  return (
    <VariableContext.Provider
      value={{
        variables,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        refreshVariables,
        isRefreshing,
        refreshCount,
        resetVariables
      }}
    >
      {children}
    </VariableContext.Provider>
  );
};

export const useVariableContext = (): IVariableContextProps => {
  const context = useContext(VariableContext);
  if (context === undefined) {
    throw new Error(
      'useVariableContext must be used within a VariableProvider'
    );
  }
  return context;
};
