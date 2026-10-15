import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabShell
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IKernelData } from '@mljar/kernel-data';
import kernelDataPlugin from './services/kernelDataPlugin';
import { ITranslator } from '@jupyterlab/translation';
import { t, translator as trans } from './translator';

import { createVariableInspectorSidebar } from './components/variableInspectorSidebar';
import { NotebookWatcher } from './watchers/notebookWatcher';
import { notebookExecutionRefreshCoordinator } from './services/notebookExecutionRefreshCoordinator';

export const VARIABLE_INSPECTOR_ID = 'variable-inspector:plugin';
export const autoRefreshProperty = 'variableInspectorAutoRefresh';
export const showTypeProperty = 'variableInspectorShowType';
export const showShapeProperty = 'variableInspectorShowShape';
export const showSizeProperty = 'variableInspectorShowSize';

const leftTab: JupyterFrontEndPlugin<void> = {
  id: VARIABLE_INSPECTOR_ID,
  description: t('A JupyterLab extension to easy manage variables.'),
  autoStart: true,
  requires: [ILabShell, ISettingRegistry, IKernelData, ITranslator],
  activate: async (
    app: JupyterFrontEnd,
    labShell: ILabShell,
    settingregistry: ISettingRegistry | null,
    kernelData: IKernelData,
    translator: ITranslator
  ) => {
    const lang = translator.languageCode;
    if (lang === 'pl-PL') {
      trans.setLanguage('pl');
    }
    await notebookExecutionRefreshCoordinator.initialize(
      settingregistry,
      VARIABLE_INSPECTOR_ID,
      autoRefreshProperty
    );
    const notebookWatcher = new NotebookWatcher(app.shell);
    const widget = createVariableInspectorSidebar(
      notebookWatcher,
      app.commands,
      labShell,
      settingregistry,
      kernelData
    );

    app.shell.add(widget, 'left', { rank: 1998 });
  }
};

export default [kernelDataPlugin, leftTab];
