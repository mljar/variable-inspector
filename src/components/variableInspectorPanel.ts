import { ILabShell } from '@jupyterlab/application';
import { VariablePanelWidget } from './variablePanelWidget';
import { panelIcon } from '../icons/panelIcon';

export function createEmptyVariableInspectorPanel(
  labShell: ILabShell,
  variableName: string,
  variableType: string,
  variableData: any[]
): void {
  const panel = new VariablePanelWidget({
    variableName,
    variableType,
    variableData
  });

  panel.id = 'custom-variableinspector';
  panel.title.label = `${variableType} ${variableName}`;
  panel.title.closable = true;
  panel.title.icon = panelIcon;

  labShell.add(panel, 'main', { mode: 'split-right' });
  labShell.activateById(panel.id);
}
