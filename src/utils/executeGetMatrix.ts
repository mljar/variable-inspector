import { KernelMessage } from '@jupyterlab/services';
import { NotebookPanel } from '@jupyterlab/notebook';
import { getMatrix } from '../python_code/getMatrix';

export const executeMatrixContent = async (
  varName: string,
  varStartColumn: number,
  varEndColumn: number,
  varStartRow: number,
  varEndRow: number,
  notebookPanel: NotebookPanel
): Promise<any> => {
  if (!notebookPanel) {
    throw new Error('Kernel not available.');
  }

  const code = getMatrix(
    varName,
    varStartRow,
    varEndRow,
    varStartColumn,
    varEndColumn
  );

  return new Promise((resolve, reject) => {
    let outputData = '';
    let resultResolved = false;
    const future =
      notebookPanel.sessionContext?.session?.kernel?.requestExecute({
        code,
        store_history: false
      });

    if (!future) {
      return reject(new Error('No future returned from kernel execution.'));
    }

    future.onIOPub = (msg: KernelMessage.IIOPubMessage) => {
      const msgType = msg.header.msg_type;

      if (msgType === 'execute_result' || msgType === 'display_data') {
        const content = msg.content as any;
        if (content.data && content.data['application/json']) {
          resultResolved = true;
          resolve(content.data['application/json']);
        } else if (content.data && content.data['text/plain']) {
          outputData += content.data['text/plain'];
        }
      } else if (msgType === 'stream') {
        /* empty */
      } else if (msgType === 'error') {
        console.error('Python error:', msg.content);
        reject(new Error('Error during Python execution.'));
      }
    };

    future.done.then(() => {
      if (!resultResolved) {
        try {
          const cleanedData = outputData.trim();
          const parsed = JSON.parse(cleanedData);
          resolve(parsed);
        } catch (err) {
          reject(new Error('Failed to parse output from Python.'));
        }
      }
    });
  });
};
