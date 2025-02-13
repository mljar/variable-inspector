import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { Kernel } from '@jupyterlab/services';
import { useNotebookPanelContext } from './notebookPanelContext';
import { useVariableContext } from './notebookVariableContext';
import { kernelOperationNotifier } from '../utils/kernelOperationNotifier';

import { VARIABLE_INSPECTOR_ID, autoRefreshProperty } from '../index';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

interface IProps {
  settingRegistry: ISettingRegistry | null;
  children: React.ReactNode;
}

const KernelIdleWatcherContext = createContext({});

export const KernelIdleWatcherContextProvider: React.FC<IProps> = ({
  settingRegistry,
  children
}) => {
  const notebookPanel = useNotebookPanelContext();
  const [kernelStatus, setKernelStatus] = useState<Kernel.Status>('unknown');
  const timerRef = useRef<number | null>(null);
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const { refreshVariables, isRefreshing } = useVariableContext();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [inOperation, setInOperation] = useState(kernelOperationNotifier.inProgress);
  void isRefreshing;

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
    console.log("refreshing useEffect variables kernel status 1");
    loadAutoRefresh();
  }, []);

useEffect(() => {
    const callback = () => setInOperation(kernelOperationNotifier.inProgress);
    kernelOperationNotifier.operationChanged.connect(callback);
    return () => {
      kernelOperationNotifier.operationChanged.disconnect(callback);
    };
  }, []);

  useEffect(() => {
    console.log("refresh 2");
    if (!notebookPanel || !notebookPanel.sessionContext) return;
    const kernel = notebookPanel.sessionContext?.session?.kernel;
    if (!kernel) return;
    const onKernelStatusChange = () => {
      setKernelStatus(kernel.status);
    };
    kernel.statusChanged.connect(onKernelStatusChange);
    return () => {
      kernel.statusChanged.disconnect(onKernelStatusChange);
    };
  }, [notebookPanel?.sessionContext?.session?.kernel]);

  // first idea to solve the problem, code might be unstable
  useEffect(() => {
    if (inOperation) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (kernelStatus === 'idle' && autoRefresh) {
      if (!hasRefreshed) {
        timerRef.current = window.setTimeout(() => {
          if (
            notebookPanel &&
            notebookPanel.sessionContext?.session?.kernel?.status === 'idle' &&
            !inOperation
          ) {
            refreshVariables();
            setHasRefreshed(true);
          }
        }, 300);
      }
    } else {
    console.log("refreshing useEffect variables kernel status 3");
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (inOperation && notebookPanel) {
        setHasRefreshed(false);
      }
    }

    return () => {
      if (timerRef.current) {
    console.log("refreshing useEffect variables kernel status 4");
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    kernelStatus,
    notebookPanel,
    refreshVariables,
    hasRefreshed,
    autoRefresh,
    inOperation
  ]);

  return (
    <KernelIdleWatcherContext.Provider value={{ kernelStatus }}>
      {children}
    </KernelIdleWatcherContext.Provider>
  );
};

export const useKernelIdleWatcherContext = () =>
  useContext(KernelIdleWatcherContext);
