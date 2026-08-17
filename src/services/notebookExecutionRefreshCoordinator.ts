import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { Kernel, KernelMessage } from '@jupyterlab/services';
import { kernelOperationNotifier } from '../utils/kernelOperationNotifier';
import { NotebookLikeWidget } from '../utils/notebookTypes';

type RefreshListener = () => void;
type Unsubscribe = () => void;

interface IKernelEntry {
  kernel: Kernel.IKernelConnection;
  listeners: Set<RefreshListener>;
  executionIds: Set<string>;
  refreshTimer: ReturnType<typeof setTimeout> | null;
  onAnyMessage: (
    sender: Kernel.IKernelConnection,
    args: Kernel.IAnyMessageArgs
  ) => void;
}

/**
 * Shares one execution observer between all variable views connected to the
 * same kernel. Variable Inspector requests are ignored so a refresh cannot
 * trigger another refresh.
 */
export class NotebookExecutionRefreshCoordinator {
  private _enabled = true;
  private _entries = new Map<string, IKernelEntry>();

  async initialize(
    settingRegistry: ISettingRegistry | null,
    pluginId: string,
    autoRefreshProperty: string
  ): Promise<void> {
    if (!settingRegistry) {
      return;
    }

    try {
      const settings = await settingRegistry.load(pluginId);
      const updateEnabled = (): void => {
        this._enabled = settings.get(autoRefreshProperty).composite as boolean;
        if (!this._enabled) {
          this._clearRefreshTimers();
        }
      };
      updateEnabled();
      settings.changed.connect(updateEnabled);
    } catch (reason) {
      console.error('Failed to load auto refresh settings', reason);
    }
  }

  subscribe(
    notebookPanel: NotebookLikeWidget,
    listener: RefreshListener
  ): Unsubscribe {
    if (!notebookPanel) {
      return () => undefined;
    }

    const sessionContext = notebookPanel.context.sessionContext;
    let detachKernel = this._subscribeKernel(
      sessionContext.session?.kernel ?? null,
      listener
    );

    const onKernelChanged = (): void => {
      detachKernel();
      detachKernel = this._subscribeKernel(
        sessionContext.session?.kernel ?? null,
        listener
      );
    };

    sessionContext.kernelChanged.connect(onKernelChanged);

    return () => {
      sessionContext.kernelChanged.disconnect(onKernelChanged);
      detachKernel();
    };
  }

  refresh(notebookPanel: NotebookLikeWidget): boolean {
    const kernel = notebookPanel?.context.sessionContext.session?.kernel;
    if (!kernel) {
      return false;
    }
    const entry = this._entries.get(kernel.id);
    if (!entry) {
      return false;
    }
    this._scheduleRefresh(entry, true);
    return true;
  }

  private _subscribeKernel(
    kernel: Kernel.IKernelConnection | null,
    listener: RefreshListener
  ): Unsubscribe {
    if (!kernel) {
      return () => undefined;
    }

    let entry = this._entries.get(kernel.id);
    if (!entry || entry.kernel !== kernel) {
      if (entry) {
        this._disposeEntry(entry);
      }
      entry = this._createEntry(kernel);
      this._entries.set(kernel.id, entry);
    }

    entry.listeners.add(listener);

    return () => {
      const currentEntry = this._entries.get(kernel.id);
      if (!currentEntry || currentEntry !== entry) {
        return;
      }
      currentEntry.listeners.delete(listener);
      if (currentEntry.listeners.size === 0) {
        this._disposeEntry(currentEntry);
        this._entries.delete(kernel.id);
      }
    };
  }

  private _createEntry(kernel: Kernel.IKernelConnection): IKernelEntry {
    const entry: IKernelEntry = {
      kernel,
      listeners: new Set<RefreshListener>(),
      executionIds: new Set<string>(),
      refreshTimer: null,
      onAnyMessage: () => undefined
    };

    entry.onAnyMessage = (_sender, args) => {
      this._handleKernelMessage(entry, args);
    };
    kernel.anyMessage.connect(entry.onAnyMessage);
    return entry;
  }

  private _handleKernelMessage(
    entry: IKernelEntry,
    args: Kernel.IAnyMessageArgs
  ): void {
    const message = args.msg;

    if (
      args.direction === 'send' &&
      message.header.msg_type === 'execute_request'
    ) {
      if (
        kernelOperationNotifier.inProgressSidebar ||
        kernelOperationNotifier.inProgressPanel
      ) {
        return;
      }
      entry.executionIds.add(message.header.msg_id);
      return;
    }

    if (
      args.direction !== 'recv' ||
      !KernelMessage.isStatusMsg(message) ||
      message.content.execution_state !== 'idle'
    ) {
      return;
    }

    const parentId = message.parent_header?.msg_id;
    if (!parentId || !entry.executionIds.delete(parentId)) {
      return;
    }

    this._scheduleRefresh(entry);
  }

  private _scheduleRefresh(entry: IKernelEntry, force = false): void {
    if (!this._enabled && !force) {
      return;
    }
    if (entry.refreshTimer) {
      clearTimeout(entry.refreshTimer);
    }
    entry.refreshTimer = setTimeout(() => {
      entry.refreshTimer = null;
      for (const listener of Array.from(entry.listeners)) {
        listener();
      }
    }, 150);
  }

  private _clearRefreshTimers(): void {
    for (const entry of this._entries.values()) {
      if (entry.refreshTimer) {
        clearTimeout(entry.refreshTimer);
        entry.refreshTimer = null;
      }
    }
  }

  private _disposeEntry(entry: IKernelEntry): void {
    if (entry.refreshTimer) {
      clearTimeout(entry.refreshTimer);
    }
    entry.kernel.anyMessage.disconnect(entry.onAnyMessage);
    entry.executionIds.clear();
    entry.listeners.clear();
  }
}

export const notebookExecutionRefreshCoordinator =
  new NotebookExecutionRefreshCoordinator();
