import { Token } from '@lumino/coreutils';
import { Signal, ISignal } from '@lumino/signaling';
/** Minimal structural contract, compatible with different JupyterLab 4 minors. */
export interface SessionContext {
  readonly isDisposed: boolean;
  readonly session: { readonly kernel: { readonly id: string } | null } | null;
  readonly kernelChanged: ISignal<any, any>;
  readonly statusChanged: ISignal<any, string>;
  readonly disposed: ISignal<any, void>;
}

export type DataKind = 'variables' | 'packages';
export type Status = 'unknown' | 'loading' | 'loaded' | 'error';
export interface Variable {
  varName: string;
  varType: string;
  varShape?: string | string[];
  isMatrix?: boolean;
  varColumns?: unknown[];
  varColumnTypes?: unknown[];
  [key: string]: any;
}
export interface Package {
  name: string;
  version: string;
}
export interface Snapshot<T> {
  status: Status;
  items: T[];
  error?: string;
}
export interface Change {
  kernelId: string;
  kind: DataKind;
}
export interface Request {
  kernelId: string;
  kind: DataKind;
  serial: number;
}
export interface IKernelData {
  readonly changed: ISignal<IKernelData, Change>;
  variables(kernelId?: string): Snapshot<Variable>;
  packages(kernelId?: string): Snapshot<Package>;
  begin(kernelId: string, kind: DataKind): Request;
  current(request: Request): boolean;
  publish(request: Request, items: Variable[] | Package[]): boolean;
  fail(request: Request, message: string): boolean;
  invalidate(kernelId: string): void;
  track(context: SessionContext): void;
}
export const IKernelData = new Token<IKernelData>(
  '@mljar/kernel-data:IKernelData'
);

/** No storage adapter: all snapshots live only in this frontend process. */
export class KernelData implements IKernelData {
  readonly changed: Signal<IKernelData, Change> = new Signal<
    IKernelData,
    Change
  >(this);
  private serial = 0;
  private records = new Map<
    string,
    Map<DataKind, { request: Request; snapshot: Snapshot<any> }>
  >();
  private contexts = new Map<SessionContext, string | undefined>();

  private read<T>(id: string | undefined, kind: DataKind): Snapshot<T> {
    const snapshot = id ? this.records.get(id)?.get(kind)?.snapshot : undefined;
    // Consumers cannot mutate shared state through a returned snapshot.
    return snapshot
      ? JSON.parse(JSON.stringify(snapshot))
      : { status: 'unknown', items: [] };
  }
  variables(id?: string): Snapshot<Variable> {
    return this.read(id, 'variables');
  }
  packages(id?: string): Snapshot<Package> {
    return this.read(id, 'packages');
  }
  begin(kernelId: string, kind: DataKind): Request {
    if (!kernelId) {
      throw new Error('A kernel ID is required');
    }
    const request = { kernelId, kind, serial: ++this.serial };
    if (!this.records.has(kernelId)) {
      this.records.set(kernelId, new Map());
    }
    this.records
      .get(kernelId)!
      .set(kind, { request, snapshot: { status: 'loading', items: [] } });
    this.changed.emit({ kernelId, kind });
    return request;
  }
  current(request: Request): boolean {
    return (
      this.records.get(request.kernelId)?.get(request.kind)?.request === request
    );
  }
  publish(request: Request, items: Variable[] | Package[]): boolean {
    if (!this.current(request)) {
      return false;
    }
    this.records.get(request.kernelId)!.get(request.kind)!.snapshot = {
      status: 'loaded',
      items: JSON.parse(JSON.stringify(items))
    };
    this.changed.emit(request);
    return true;
  }
  fail(request: Request, message: string): boolean {
    if (!this.current(request)) {
      return false;
    }
    this.records.get(request.kernelId)!.get(request.kind)!.snapshot = {
      status: 'error',
      items: [],
      error: message
    };
    this.changed.emit(request);
    return true;
  }
  invalidate(kernelId: string): void {
    this.records.delete(kernelId);
    for (const kind of ['variables', 'packages'] as const) {
      this.changed.emit({ kernelId, kind });
    }
  }
  track(context: SessionContext): void {
    if (context.isDisposed || this.contexts.has(context)) {
      return;
    }
    const release = (id?: string) => {
      if (id && !Array.from(this.contexts.values()).includes(id)) {
        this.invalidate(id);
      }
    };
    const update = () => {
      const old = this.contexts.get(context);
      const id = context.session?.kernel?.id;
      this.contexts.set(context, id);
      if (old !== id) {
        release(old);
      }
    };
    const status = (_: unknown, value: string) => {
      const id = context.session?.kernel?.id;
      if (
        id &&
        ['restarting', 'autorestarting', 'dead', 'terminating'].includes(value)
      ) {
        this.invalidate(id);
      }
    };
    const dispose = () => {
      const id = this.contexts.get(context);
      this.contexts.delete(context);
      context.kernelChanged.disconnect(update);
      context.statusChanged.disconnect(status);
      context.disposed.disconnect(dispose);
      release(id);
    };
    this.contexts.set(context, undefined);
    update();
    context.kernelChanged.connect(update);
    context.statusChanged.connect(status);
    context.disposed.connect(dispose);
  }
}

export { LEGACY_KEYS, removeLegacyKernelData } from './cleanup';
