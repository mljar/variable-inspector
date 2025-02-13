import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { useNotebookPanelContext } from './notebookPanelContext';

interface KernelIdleWatcherContextValue {
  isIdle: boolean;
}

const KernelIdleWatcherContext = createContext<KernelIdleWatcherContextValue>({
  isIdle: false
});

export const SimpleKernelIdleWatcherContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const notebookPanel = useNotebookPanelContext();
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!notebookPanel) {
      console.log('no notebook');
      return;
    }
    const kernel = notebookPanel.sessionContext.session?.kernel;
    if (!kernel) {
      console.log('nokernel');
      return;
    }

    const onKernelStatusChange = () => {
      if (kernel.status === 'idle') {
        if (timerRef.current === null) {
          timerRef.current = window.setTimeout(() => {
            if (kernel.status === 'idle') {
              setIsIdle(true);
            }
            timerRef.current = null;
          }, 300);
        }
      } else {
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setIsIdle(false);
      }
    };

    kernel.statusChanged.connect(onKernelStatusChange);
    onKernelStatusChange();

    return () => {
      kernel.statusChanged.disconnect(onKernelStatusChange);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [notebookPanel?.sessionContext?.session?.kernel, notebookPanel]);

  return (
    <KernelIdleWatcherContext.Provider value={{ isIdle }}>
      {children}
    </KernelIdleWatcherContext.Provider>
  );
};

export const useSimpleKernelIdleWatcherContext = () =>
  useContext(KernelIdleWatcherContext);
