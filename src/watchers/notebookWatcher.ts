import { JupyterFrontEnd } from '@jupyterlab/application';
import { Widget } from '@lumino/widgets';
import { Signal } from '@lumino/signaling';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { NotebookLikeWidget } from '../utils/notebookTypes';

const NOTEBOOK_FACTORY_NAMES = new Set([
  'Notebook',
  'Conversation Notebook'
]);

function getNotebookDocument(widget: Widget | null): NotebookLikeWidget {
  if (!(widget instanceof DocumentWidget)) {
    return null;
  }

  const contextAny = widget.context as any;
  const factoryName = contextAny?.factoryName ?? contextAny?.factory?.name ?? '';
  const model = contextAny?.model;
  const looksLikeNotebookModel =
    !!model?.cells || !!model?.sharedModel?.cells || !!model?.sharedModel?.nbformat;

  if (!NOTEBOOK_FACTORY_NAMES.has(factoryName) && !looksLikeNotebookModel) {
    return null;
  }

  return widget;
}

export class NotebookWatcher {
  constructor(shell: JupyterFrontEnd.IShell) {
    this._shell = shell;
    this._shell.currentChanged?.connect((sender, args) => {
      this._mainAreaWidget = args.newValue;
      this._notebookPanel = this.notebookPanel();
      this._notebookPanelChanged.emit(this._notebookPanel);
      if (this._notebookPanel) {
        this._attachKernelChangeHandler();
      } else {
        this._kernelInfo = null;
        this._kernelChanged.emit(null);
      }
    });
  }

  get notebookPanelChanged(): Signal<this, NotebookLikeWidget> {
    return this._notebookPanelChanged;
  }

  get kernelInfo(): KernelInfo | null {
    return this._kernelInfo;
  }

  get kernelChanged(): Signal<this, KernelInfo | null> {
    return this._kernelChanged;
  }

  notebookPanel(): NotebookLikeWidget {
    return getNotebookDocument(this._mainAreaWidget);
  }

  private _attachKernelChangeHandler(): void {
    if (this._notebookPanel) {
      const session = this._notebookPanel.context.sessionContext.session;

      if (session) {
        session.kernelChanged.connect(this._onKernelChanged, this);
        this._updateKernelInfo(session.kernel);
      } else {
        setTimeout(() => {
          const delayedSession =
            this._notebookPanel?.context.sessionContext.session;
          if (delayedSession) {
            delayedSession.kernelChanged.connect(this._onKernelChanged, this);
            this._updateKernelInfo(delayedSession.kernel);
          } else {
            console.warn('Session not initialized after delay');
          }
        }, 2000);
      }
    } else {
      // console.warn('Session not initalizated');
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
  protected _notebookPanel: NotebookLikeWidget = null;
  protected _notebookPanelChanged = new Signal<this, NotebookLikeWidget>(
    this
  );
}

export type KernelInfo = {
  name: string;
  id: string;
};
