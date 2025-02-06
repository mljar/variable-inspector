import { ILabShell } from '@jupyterlab/application';
import { VariablePanelWidget } from './variablePanelWidget';


export function createEmptyVariableInspectorPanel(
  labShell: ILabShell,
  variableName: string,
  variableType: string
): void {

  const panel = new VariablePanelWidget({variableName, variableType});

  panel.id = 'custom-variableinspector';
  panel.title.label = `${variableType} ${variableName}`;
  panel.title.closable = true;

  labShell.add(panel, 'main', { mode: 'split-right' });
  labShell.activateById(panel.id);
}
