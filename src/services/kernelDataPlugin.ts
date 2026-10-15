import type { JupyterFrontEndPlugin } from '@jupyterlab/application';
import { IStateDB } from '@jupyterlab/statedb';
import { IKernelData, KernelData } from '@mljar/kernel-data';
import { removeLegacyKernelData } from '@mljar/kernel-data';
const plugin: JupyterFrontEndPlugin<IKernelData> = {
  id: 'variable-inspector:kernel-data',
  autoStart: true,
  provides: IKernelData,
  requires: [IStateDB],
  activate: (app, state: IStateDB) => {
    // StateDB restoration depends on startup. Awaiting it during activation
    // would deadlock every extension that requires this service.
    void app.restored
      .then(() => removeLegacyKernelData(state))
      .catch(error => {
        console.error('Unable to remove legacy kernel workspace data', error);
      });
    return new KernelData();
  }
};
export default plugin;
