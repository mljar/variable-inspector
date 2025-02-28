import { Signal } from '@lumino/signaling';

export class KernelOperationNotifier {
  private _inProgressSidebar = false;
  private _inProgressPanel = false;

  readonly sidebarOperationChanged = new Signal<this, boolean>(this);
  readonly panelOperationChanged = new Signal<this, boolean>(this);

  set inProgressSidebar(value: boolean) {
    if (this._inProgressSidebar !== value) {
      this._inProgressSidebar = value;
      this.sidebarOperationChanged.emit(value);
    }
  }
  get inProgressSidebar(): boolean {
    return this._inProgressSidebar;
  }

  set inProgressPanel(value: boolean) {
    if (this._inProgressPanel !== value) {
      this._inProgressPanel = value;
      this.panelOperationChanged.emit(value);
    }
  }
  get inProgressPanel(): boolean {
    return this._inProgressPanel;
  }
}

export const kernelOperationNotifier = new KernelOperationNotifier();

export async function withIgnoredSidebarKernelUpdates<T>(
  fn: () => Promise<T>
): Promise<T> {
  kernelOperationNotifier.inProgressSidebar = true;
  try {
    return await fn();
  } finally {
    kernelOperationNotifier.inProgressSidebar = false;
  }
}

export async function withIgnoredPanelKernelUpdates<T>(
  fn: () => Promise<T>
): Promise<T> {
  kernelOperationNotifier.inProgressPanel = true;
  try {
    return await fn();
  } finally {
    kernelOperationNotifier.inProgressPanel = false;
  }
}
