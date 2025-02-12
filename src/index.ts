import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabShell
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { createEmptyVariableInspectorPanel } from './components/variableInspectorPanel';
import { createVariableInspectorSidebar } from './components/variableInspectorSidebar';
import { NotebookWatcher } from './watchers/notebookWatcher';

export const VARIABLE_INSPECTOR_ID = 'variable-inspector:plugin';

const leftTab: JupyterFrontEndPlugin<void> = {
  id: VARIABLE_INSPECTOR_ID,
  description: 'A JupyterLab extension to easy manage variables.',
  autoStart: true,
  requires: [ILabShell, ISettingRegistry],
  activate: async (
    app: JupyterFrontEnd,
    labShell: ILabShell,
    settingregistry: ISettingRegistry | null
  ) => {
    const notebookWatcher = new NotebookWatcher(app.shell);

    // notebookWatcher.selectionChanged.connect((sender, selections) => { });

    const widget = createVariableInspectorSidebar(
      notebookWatcher,
      app.commands,
      labShell,
      settingregistry
    );

    app.shell.add(widget, 'left', { rank: 1998 });
  }
};

const customVariableInspectorPlugin: JupyterFrontEndPlugin<void> = {
  id: 'custom-variableinspector',
  autoStart: true,
  requires: [ICommandPalette, ILabShell],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    labShell: ILabShell
  ) => {
    const command = 'custom:open-variable-inspector';
    app.commands.addCommand(command, {
      label: 'Open Custom Variable Inspector',
      execute: (args: any) => {
        const variableName = args.variableName || 'Default Name';
        const variableType = args.variableType || 'Deafult Type';
        const variableData = args.variableData || 'No Data';
        createEmptyVariableInspectorPanel(
          labShell,
          variableName,
          variableType,
          variableData
        );
      }
    });

    palette.addItem({ command, category: 'Custom Extensions' });
  }
};

export default [customVariableInspectorPlugin, leftTab];
