import { Signal } from '@lumino/signaling';

export class KernelOperationNotifier {
  private _inProgress = false;
  readonly operationChanged = new Signal<this, boolean>(this);

  set inProgress(value: boolean) {
    if (this._inProgress !== value) {
      this._inProgress = value;
      this.operationChanged.emit(value);
    }
  }

  get inProgress(): boolean {
    return this._inProgress;
  }
}

export const kernelOperationNotifier = new KernelOperationNotifier();

export async function withIgnoredKernelUpdates<T>(fn: () => Promise<T>): Promise<T> {
  kernelOperationNotifier.inProgress = true;
  try {
    return await fn();
  } finally {
    kernelOperationNotifier.inProgress = false;
  }
}
