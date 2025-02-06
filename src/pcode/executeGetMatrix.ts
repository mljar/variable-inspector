import { KernelMessage } from '@jupyterlab/services';
import { getMatrix } from './getMatrix';
import { useNotebookPanelContext } from '../context/notebookPanelContext';
import { useNotebookKernelContext } from '../context/notebookKernelContext';


export const executeMatrixContent = async (varName: string, ): Promise<any> => {
  console.log("AAAAAAAAA")
  const notebookPanel = useNotebookPanelContext();

  if (!notebookPanel) {
    throw new Error("Kernel not available.");
  }

  const code = getMatrix(varName);

  return new Promise((resolve, reject) => {
    let outputData = "";
    const future = notebookPanel.sessionContext?.session?.kernel?.requestExecute({
      code,
      store_history: false,
    });

    if (future) {
      console.log("future",future);
      future.onIOPub = (msg: KernelMessage.IIOPubMessage) => {
        const msgType = msg.header.msg_type;
        if (
          msgType === 'stream' ||
          msgType === 'execute_result' ||
          msgType === 'display_data'
        ) {
          const content = msg.content as any;
          if (content.text) {
            outputData += content.text;
          }
        } else if (msgType === 'error') {
          const errContent = msg.content;
          console.log("ERROR",errContent);
        }
      };

      future.onReply = () => {
        try {
          const parsed = JSON.parse(outputData);
          resolve(parsed);
        } catch (err) {
          reject(new Error("Failed to parse output from Python."));
        }
      };
    } else {
      reject(new Error("No future returned from kernel execution."));
    }
  });
};

