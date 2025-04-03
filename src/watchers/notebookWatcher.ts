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
            console.warn('Session not initialized after delay');
          }
        }, 2000);
      }
    } else {
      console.warn('Session not initalizated');
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
  protected _notebookPanel: NotebookPanel | null = null;
  protected _notebookPanelChanged = new Signal<this, NotebookPanel | null>(
    this
  );
}

export type KernelInfo = {
  name: string;
  id: string;
};
