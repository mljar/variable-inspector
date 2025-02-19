import { JupyterFrontEnd } from '@jupyterlab/application';
import { Notebook } from '@jupyterlab/notebook';
import { Widget } from '@lumino/widgets';
import { Signal } from '@lumino/signaling';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { NotebookPanel } from '@jupyterlab/notebook';


function getNotebook(widget: Widget | null): Notebook | null {
  if (!(widget instanceof DocumentWidget)) {
    return null;
  }

  const { content } = widget;
  if (!(content instanceof Notebook)) {
    return null;
  }

  return content;
}

export type NotebookSelection = {
  start: { line: number; column: number };
  end: { line: number; column: number };
  text: string;
  numLines: number;
  widgetId: string;
  cellId?: string;
};

export type NotebookSelections = NotebookSelection[];

export function getNotebookSelections(notebook: Notebook): NotebookSelections {
  const selections: NotebookSelections = [];

  const cellModels = notebook.model?.cells;

  if (cellModels) {
    for (let i = 0; i < cellModels.length; i++) {
      const cell = cellModels.get(i);
      const cellSource = cell?.sharedModel.getSource();
      const cellId = cell?.id;

      if (cellSource && cellId) {
        const numLines = cellSource.split('\n').length;

        const selection: NotebookSelection = {
          start: { line: 0, column: 0 },
          end: { line: numLines - 1, column: cellSource.length },
          text: cellSource,
          numLines,
          widgetId: notebook.id,
          cellId
        };

        selections.push(selection);
      }
    }
  }


  return selections;
}

export class NotebookWatcher {
  constructor(shell: JupyterFrontEnd.IShell) {
    this._shell = shell;
    this._shell.currentChanged?.connect((sender, args) => {
      this._mainAreaWidget = args.newValue;
      this._notebookPanel = this.notebookPanel();
      this._notebookPanelChanged.emit(this._notebookPanel);
      this._attachKernelChangeHandler();
    });


  }

  get selection(): NotebookSelections {
    return this._selections;
  }

  get selectionChanged(): Signal<this, NotebookSelections> {
    return this._selectionChanged;
  }

  get notebookPanelChanged(): Signal<this, NotebookPanel | null> {
    return this._notebookPanelChanged;
  }

    get kernelInfo(): KernelInfo | null {
    return this._kernelInfo;
  }

  get kernelChanged(): Signal<this, KernelInfo | null> {
    return this._kernelChanged;
  }

  notebookPanel(): NotebookPanel | null {
    const notebook = getNotebook(this._mainAreaWidget);
    if (!notebook) {
      return null;
    }
    return notebook.parent instanceof NotebookPanel ? notebook.parent : null;
  }


 private _attachKernelChangeHandler(): void {
    if (this._notebookPanel) {
      const session = this._notebookPanel.sessionContext.session;
      
      if (session) {
        session.kernelChanged.connect(this._onKernelChanged, this);
        this._updateKernelInfo(session.kernel);
      } else {
        setTimeout(() => {
          const delayedSession = this._notebookPanel?.sessionContext.session;
          if (delayedSession) {
            delayedSession.kernelChanged.connect(this._onKernelChanged, this);
            this._updateKernelInfo(delayedSession.kernel);
          } else {
            console.warn("Session not initialized after delay");
          }
        }, 2000);      }
    } else {
      console.warn("Session not initalizated");
    }
  }

  private _onKernelChanged(
    sender: any,
    args: { name: string; oldValue: any; newValue: any }
  ): void {
    if (args.newValue) {
      this._updateKernelInfo(args.newValue);
    } else {
      this._kernelInfo = null;
      this._kernelChanged.emit(null);
    }
  }

  private _updateKernelInfo(kernel: any): void {
    this._kernelInfo = {
      name: kernel.name,
      id: kernel.id
    };
    this._kernelChanged.emit(this._kernelInfo);
  }

  protected _kernelInfo: KernelInfo | null = null;
  protected _kernelChanged = new Signal<this, KernelInfo | null>(this);
  protected _shell: JupyterFrontEnd.IShell;
  protected _mainAreaWidget: Widget | null = null;
  protected _selections: NotebookSelections = [];
  protected _selectionChanged = new Signal<this, NotebookSelections>(this);
  protected _notebookPanel: NotebookPanel | null = null;
  protected _notebookPanelChanged = new Signal<this, NotebookPanel | null>(this);
}

export type KernelInfo = {
  name: string;
  id: string;
};

