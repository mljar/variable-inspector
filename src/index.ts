import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabShell
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IStateDB } from '@jupyterlab/statedb';
import { ITranslator } from '@jupyterlab/translation';
import { translator as t2} from './translator';


import { createVariableInspectorSidebar } from './components/variableInspectorSidebar';
import { NotebookWatcher } from './watchers/notebookWatcher';

export const VARIABLE_INSPECTOR_ID = 'variable-inspector:plugin';
export const autoRefreshProperty = 'variableInspectorAutoRefresh';
export const showTypeProperty = 'variableInspectorShowType';
export const showShapeProperty = 'variableInspectorShowShape';
export const showSizeProperty = 'variableInspectorShowSize';

const leftTab: JupyterFrontEndPlugin<void> = {
  id: VARIABLE_INSPECTOR_ID,
  description: 'A JupyterLab extension to easy manage variables.',
  autoStart: true,
  requires: [ILabShell, ISettingRegistry, IStateDB, ITranslator],
  activate: async (
    app: JupyterFrontEnd,
    labShell: ILabShell,
    settingregistry: ISettingRegistry | null,
    stateDB: IStateDB,
    translator: ITranslator
  ) => {
    const lang = translator.languageCode;
    console.log(lang);
    if (lang === "pl-PL") t2.setLanguage('pl');
    const notebookWatcher = new NotebookWatcher(app.shell);
    const widget = createVariableInspectorSidebar(
      notebookWatcher,
      app.commands,
      labShell,
      settingregistry,
      stateDB
    );
    // initialize variables list
    stateDB.save('mljarVariablesStatus', 'loaded');
    stateDB.save('mljarVariables', []);

    app.shell.add(widget, 'left', { rank: 1998 });
  }
};

export default [leftTab];
