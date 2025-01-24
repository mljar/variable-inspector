import { Widget } from '@lumino/widgets';
import { ILabShell } from '@jupyterlab/application';


class VariableInspectorPanel extends Widget {
  constructor() {
    super();
    this.addClass('jp-VarInspector');

    const hello = document.createElement('div');
    hello.textContent = 'Hello World';
    hello.style.padding = '10px';
    hello.style.fontSize = '16px';
    this.node.appendChild(hello);
  }
}

export function createEmptyVariableInspectorPanel(labShell: ILabShell): void {
  const panel = new VariableInspectorPanel();

  panel.id = 'custom-variableinspector';
  panel.title.label = 'Custom Variable Inspector';
  panel.title.closable = true;


  labShell.add(panel, 'main');
  labShell.activateById(panel.id);
}

