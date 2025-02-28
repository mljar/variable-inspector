import { ILabShell } from '@jupyterlab/application';
import { VariablePanelWidget } from './variablePanelWidget';
import { panelIcon } from '../icons/panelIcon';
import { NotebookPanel } from '@jupyterlab/notebook';

export function createEmptyVariableInspectorPanel(
  labShell: ILabShell,
  variableName: string,
  variableType: string,
  variableShape: string,
  notebookPanel?: NotebookPanel | null
): void {
  const panel = new VariablePanelWidget({
    variableName,
    variableType,
    variableShape,
    notebookPanel
  });

  panel.id = `${variableType}-${variableName}`;
  panel.title.label = `${variableType} ${variableName}`;
  panel.title.closable = true;
  panel.title.icon = panelIcon;

  const existingPanel = Array.from(labShell.widgets('main')).find(
    widget => widget.id === panel.id
  );

  if (existingPanel) {
    labShell.add(panel, 'main', { mode: 'tab-after', ref: existingPanel.id });
  } else {
    labShell.add(panel, 'main', { mode: 'split-right' });
  }

  labShell.activateById(panel.id);
}
