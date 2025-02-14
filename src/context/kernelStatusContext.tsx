import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { useNotebookPanelContext } from './notebookPanelContext';
import { kernelOperationNotifier } from '../utils/kernelOperationNotifier';

import { VARIABLE_INSPECTOR_ID, autoRefreshProperty } from '../index';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { useVariableContext } from './notebookVariableContext';
import {
  getLastIdleTimestamp,
  setLastIdleTimestamp
} from '../utils/globalKernelTimeStamp';

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
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { refreshVariables } = useVariableContext();
  const prevStatus = useRef<string | null>(null);
  void autoRefresh;

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
    if (!notebookPanel) {
      console.log('No notebookPanel');
      return;
    }
    else{
      console.log("NotebookPanel exist");
    }

    const kernel = notebookPanel.sessionContext.session?.kernel
    console.log(kernel);
    if (!kernel) {
      console.log('No kernel');
      return;
    }
    else{
    }

    const onKernelStatusChange = (_sender: any, status: string) => {
      if (kernelOperationNotifier.inProgressPanel || kernelOperationNotifier.inProgressSidebar) {
        return;
      }
      const now = Date.now();
      const lastIdle = getLastIdleTimestamp();
      if (
        status === 'idle' &&
        prevStatus.current !== 'idle' &&
        (lastIdle === null || now - lastIdle > 300)
      ) {
        console.log("Refresh");
      refreshVariables();
      setLastIdleTimestamp(now);

      }
      prevStatus.current = status;
    };

    kernel.statusChanged.connect(onKernelStatusChange);

    return () => {
      kernel.statusChanged.disconnect(onKernelStatusChange);
    };
  }, [notebookPanel,notebookPanel?.sessionContext.session?.kernel]);

  return (
    <KernelIdleWatcherContext.Provider value={{  prevStatus }}>
      {children}
    </KernelIdleWatcherContext.Provider>
  );
};

export const useKernelIdleWatcherContext = () =>
  useContext(KernelIdleWatcherContext);
