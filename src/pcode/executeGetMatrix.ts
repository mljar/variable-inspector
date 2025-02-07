import { KernelMessage } from '@jupyterlab/services';
import { getMatrix } from './getMatrix';
import { NotebookPanel } from '@jupyterlab/notebook';

export const executeMatrixContent = async (
  varName: string,
  notebookPanel: NotebookPanel
): Promise<any> => {
  if (!notebookPanel) {
    throw new Error('Kernel not available.');
  }

  const code = getMatrix(varName);

  return new Promise((resolve, reject) => {
    let outputData = '';
    const future =
      notebookPanel.sessionContext?.session?.kernel?.requestExecute({
        code,
        store_history: false
      });

    if (future) {
      future.onIOPub = (msg: KernelMessage.IIOPubMessage) => {
        const msgType = msg.header.msg_type;
        if (
          msgType === 'stream' ||
          msgType === 'execute_result' ||
          msgType === 'display_data'
        ) {
          const content = msg.content as any;
          const textData = content.data['text/plain'];
          if (textData) {
            outputData += textData;
          }
        } else if (msgType === 'error') {
          console.log('ERROR');
        }
      };

      future.onReply = () => {
        try {
          let cleanedData = outputData.trim();

          if (
            (cleanedData.startsWith('"') && cleanedData.endsWith('"')) ||
            (cleanedData.startsWith("'") && cleanedData.endsWith("'"))
          ) {
            cleanedData = cleanedData.substring(1, cleanedData.length - 1);
          }

          cleanedData = cleanedData.replace(/'/g, '"');

          console.log('Cleaned JSON:', cleanedData);

          const parsed = JSON.parse(cleanedData);
          resolve(parsed);
        } catch (err) {
          reject(new Error('Failed to parse output from Python.'));
        }
      };
    } else {
      reject(new Error('No future returned from kernel execution.'));
    }
  });
};
