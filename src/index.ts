import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabShell,
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';
import { createEmptyVariableInspectorPanel } from './components/variableInspectorPanel';
import { createVariableInspectorSidebar } from './components/variableInspectorSidebar';
import { NotebookWatcher } from './watchers/notebookWatcher';


const leftTab: JupyterFrontEndPlugin<void> = {
  id: 'variable-manager:plugin',
  description: 'A JupyterLab extension to list, remove and install python packages from pip.',
  autoStart: true,
  activate: async (app: JupyterFrontEnd) => {

    const notebookWatcher = new NotebookWatcher(app.shell);

    notebookWatcher.selectionChanged.connect((sender, selections) => {});

    let widget = createVariableInspectorSidebar(notebookWatcher, app.commands);

    app.shell.add(widget, 'left',{rank: 1999});
  }
};


const customVariableInspectorPlugin: JupyterFrontEndPlugin<void> = {
  id: 'custom-variableinspector',
  autoStart: true,
  requires: [ICommandPalette, ILabShell],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette, labShell: ILabShell) => {
    const command = 'custom:open-variable-inspector';
    app.commands.addCommand(command, {
      label: 'Open Custom Variable Inspector',
      execute: () => {
        createEmptyVariableInspectorPanel(labShell);
      }
    });

    palette.addItem({ command, category: 'Custom Extensions' });
  }
};

export default [customVariableInspectorPlugin, leftTab];

