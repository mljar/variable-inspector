import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Kernel } from '@jupyterlab/services'
import { useNotebookPanelContext } from './notebookPanelContext'
import { useVariableContext } from './notebookVariableContext'

const KernelIdleWatcherContext = createContext({})

export const KernelIdleWatcherContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notebookPanel = useNotebookPanelContext()
  const [kernelStatus, setKernelStatus] = useState<Kernel.Status>('unknown')
  const timerRef = useRef<number | null>(null)
  const [hasRefreshed, setHasRefreshed] = useState(false)
  const { refreshVariables, isRefreshing } = useVariableContext()

  useEffect(() => {
    if (!notebookPanel || !notebookPanel.sessionContext) return
    const kernel = notebookPanel.sessionContext?.session?.kernel
    if (!kernel) return
    const onKernelStatusChange = () => {
      setKernelStatus(kernel.status)
    }
    kernel.statusChanged.connect(onKernelStatusChange)
    return () => {
      kernel.statusChanged.disconnect(onKernelStatusChange)
    }
  }, [notebookPanel?.sessionContext?.session?.kernel])

  // first idea to solve the problem, code might be unstable
  useEffect(() => {
    //clearing timeout
    if (isRefreshing) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }
    if (kernelStatus === 'idle') {
      if (!hasRefreshed) {
        timerRef.current = window.setTimeout(() => {
          if (
            notebookPanel &&
            notebookPanel.sessionContext?.session?.kernel?.status === 'idle' &&
            !isRefreshing
          ) {
            refreshVariables()
            setHasRefreshed(true)
          }
        }, 2000)
      }
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if(!isRefreshing && notebookPanel){
      setHasRefreshed(false)
      }
    }
    //clearing timeout
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [kernelStatus,notebookPanel, refreshVariables, hasRefreshed])

  return (
    <KernelIdleWatcherContext.Provider value={{ kernelStatus }}>
      {children}
    </KernelIdleWatcherContext.Provider>
  )
}

export const useKernelIdleWatcherContext = () => useContext(KernelIdleWatcherContext)
