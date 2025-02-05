import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNotebookPanelContext } from './notebookPanelContext'
import { useNotebookKernelContext } from './notebookKernelContext'
import { KernelMessage } from '@jupyterlab/services'
import { variableDict } from "../pcode/utils"

interface VariableInfo {
  name: string
  type: string
  shape: string
}

interface VariableContextProps {
  variables: VariableInfo[]
  loading: boolean
  error: string | null
  searchTerm: string
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
  refreshVariables: () => void
  isRefreshing: boolean
}

const VariableContext = createContext<VariableContextProps | undefined>(undefined)

export const VariableContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notebookPanel = useNotebookPanelContext()
  const kernel = useNotebookKernelContext()
  const [variables, setVariables] = useState<VariableInfo[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  const executeCode = useCallback(async () => {
    setIsRefreshing(true)
    setVariables([])
    setLoading(true)
    setError(null)
    if (!notebookPanel || !kernel) {
      setLoading(false)
      setIsRefreshing(false)
      return
    }
    try {
      const future = notebookPanel.sessionContext?.session?.kernel?.requestExecute({
        code: variableDict,
        store_history: false
      })
      if (future) {
        console.log("future", future);
        future.onIOPub = (msg: KernelMessage.IIOPubMessage) => {
          const msgType = msg.header.msg_type
          console.log(msgType,"msgType");
          if (
            msgType === 'execute_result' ||
            msgType === 'display_data' ||
            msgType === 'update_display_data' ||
            msgType === 'error'
          ) {
            const content = msg.content as any
            console.log(content, "content");
            const jsonData = content.data['application/json']
            const textData = content.data['text/plain']
            if (jsonData) {
              setLoading(false)
              setIsRefreshing(false)
            } else if (textData) {
              try {
                const cleanedData = textData.replace(/^['"]|['"]$/g, '')
                const doubleQuotedData = cleanedData.replace(/'/g, '"')
                const parsedData: VariableInfo[] = JSON.parse(doubleQuotedData)
                if (Array.isArray(parsedData)) {
                  const mappedVariables: VariableInfo[] = parsedData.map((item: any) => ({
                    name: item.varName,
                    type: item.varType,
                    shape: item.varShape || 'N/A'
                  }))
                  console.log(mappedVariables);
                  setVariables(mappedVariables)
                } else {
                  throw new Error('Error during parsing.')
                }
                setLoading(false)
                setIsRefreshing(false)
              } catch (err) {
                setError('Error during export JSON.')
                setLoading(false)
                setIsRefreshing(false)
              }
            }
          }
        }
      }
    } catch (err) {
      setError('Unexpected error.')
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [notebookPanel, kernel])

  useEffect(() => {
    executeCode()
  }, [executeCode])

  return (
    <VariableContext.Provider
      value={{ variables, loading, error, searchTerm, setSearchTerm, refreshVariables: executeCode, isRefreshing }}
    >
      {children}
    </VariableContext.Provider>
  )
}

export const useVariableContext = (): VariableContextProps => {
  const context = useContext(VariableContext)
  if (context === undefined) {
    throw new Error('useVariableContext must be used within a VariableProvider')
  }
  return context
}
