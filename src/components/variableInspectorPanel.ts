import { ILabShell } from '@jupyterlab/application';
import { VariablePanelWidget } from './variablePanelWidget';
import { panelIcon } from '../icons/panelIcon';
import { NotebookLikeWidget } from '../utils/notebookTypes';

export function variablePanelId(
  variableName: string,
  notebookPanel?: NotebookLikeWidget
): string {
  const notebookIdentity =
    notebookPanel?.context.path || notebookPanel?.id || 'unknown-notebook';
  return `variable-inspector:${encodeURIComponent(notebookIdentity)}:${encodeURIComponent(variableName)}`;
}

export function createEmptyVariableInspectorPanel(
  labShell: ILabShell,
  variableName: string,
  variableType: string,
  variableShape: string,
  notebookPanel?: NotebookLikeWidget
): void {
  const panelId = variablePanelId(variableName, notebookPanel);
  const existingPanel = Array.from(labShell.widgets('main')).find(
    widget => widget.id === panelId
  );

  if (existingPanel) {
    labShell.activateById(existingPanel.id);
    return;
  }

  const panel = new VariablePanelWidget({
    variableName,
    variableType,
    variableShape,
    notebookPanel
  });

  panel.id = panelId;
  panel.title.label = `${variableType} ${variableName}`;
  panel.title.closable = true;
  panel.title.icon = panelIcon;

  labShell.add(panel, 'main', { mode: 'split-right' });

  labShell.activateById(panel.id);
}
