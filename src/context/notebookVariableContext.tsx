import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import { useNotebookPanelContext } from './notebookPanelContext';
import { useNotebookKernelContext } from './notebookKernelContext';
import { KernelMessage } from '@jupyterlab/services';
import { withIgnoredSidebarKernelUpdates } from '../utils/kernelOperationNotifier';
import { variableDict } from '../python_code/getVariables';

interface IVariableInfo {
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
}

const VariableContext = createContext<IVariableContextProps | undefined>(
  undefined
);

type Task = () => Promise<void> | void;

class DebouncedTaskQueue {
  // Holds the timer handle.
  private timer: ReturnType<typeof setTimeout> | null = null;
  // Holds the most recently added task.
  private lastTask: Task | null = null;
  private delay: number;

  /**
   * @param delay Time in milliseconds to wait before executing the last task.
   */
  constructor(delay: number = 500) {
    this.delay = delay;
  }

  /**
   * Adds a new task to the queue. Only the last task added within the delay period will be executed.
   * @param task A function representing the task.
   */
  add(task: Task): void {
    // Save (or overwrite) the latest task.
    this.lastTask = task;

    // If there’s already a pending timer, clear it.
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Start (or restart) the timer.
    this.timer = setTimeout(async () => {
      if (this.lastTask) {
        try {
          // Execute the latest task.
          await this.lastTask();
        } catch (error) {
          console.error('Task execution failed:', error);
        }
      }
      // After execution, clear the stored task and timer.
      this.lastTask = null;
      this.timer = null;
    }, this.delay);
  }
}

export const VariableContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const notebookPanel = useNotebookPanelContext();
  const kernel = useNotebookKernelContext();
  const [variables, setVariables] = useState<IVariableInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const queue = new DebouncedTaskQueue(250);

  const executeCode = useCallback(async () => {
    await withIgnoredSidebarKernelUpdates(async () => {
      //setIsRefreshing(true);
      //setLoading(true);
      setError(null);

      if (!notebookPanel) {
        setVariables([]);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }
      //setVariables([]);

      try {
        const future =
          notebookPanel.sessionContext?.session?.kernel?.requestExecute({
            code: variableDict,
            store_history: false
          });
        if (future) {
          future.onIOPub = (msg: KernelMessage.IIOPubMessage) => {
            const msgType = msg.header.msg_type;
            if (
              msgType === 'execute_result' ||
              msgType === 'display_data' ||
              msgType === 'update_display_data' ||
              msgType === 'error'
            ) {
              const content = msg.content as any;
              const jsonData = content.data['application/json'];
              const textData = content.data['text/plain'];
              if (jsonData) {
                setLoading(false);
                setIsRefreshing(false);
                setRefreshCount(prev => prev + 1);
              } else if (textData) {
                try {
                  const cleanedData = textData.replace(/^['"]|['"]$/g, '');
                  const doubleQuotedData = cleanedData.replace(/'/g, '"');
                  const parsedData: IVariableInfo[] =
                    JSON.parse(doubleQuotedData);
                  if (Array.isArray(parsedData)) {
                    const mappedVariables: IVariableInfo[] = parsedData.map(
                      (item: any) => ({
                        name: item.varName,
                        type: item.varType,
                        shape: item.varShape || 'None',
                        dimension: item.varDimension,
                        size: item.varSize,
                        value: item.varSimpleValue
                      })
                    );
                    setVariables(mappedVariables);
                  } else {
                    throw new Error('Error during parsing.');
                  }
                  setLoading(false);
                  setIsRefreshing(false);
                  setRefreshCount(prev => prev + 1);
                } catch (err) {
                  setError('Error during export JSON.');
                  setVariables([]);
                  setLoading(false);
                  setIsRefreshing(false);
                }
              }
            }
          };
        }
      } catch (err) {
        setError('Unexpected error.');
        setLoading(false);
        setIsRefreshing(false);
      }
    });
    return;
  }, [notebookPanel, kernel]);

  useEffect(() => {
    executeCode();
  }, [executeCode]);

  return (
    <VariableContext.Provider
      value={{
        variables,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        refreshVariables: () => queue.add(() => executeCode()),
        isRefreshing,
        refreshCount
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
