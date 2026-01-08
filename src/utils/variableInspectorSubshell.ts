import { Kernel } from '@jupyterlab/services';

const subshellByKernelId = new Map<string, Promise<Kernel.IKernelConnection>>();

export async function provideVariableInspectorSubshellKernel(
  kernel: Kernel.IKernelConnection | null | undefined
): Promise<Kernel.IKernelConnection | null> {
  if (!kernel) {
    return null;
  }

  // If kernel doesn't support subshells, just use the main shell.
  if (!kernel.supportsSubshells) {
    return kernel;
  }

  const existing = subshellByKernelId.get(kernel.id);
  if (existing) {
    return existing;
  }

  const created = (async () => {
    try {
      // Create one subshell.
      const future = kernel.requestCreateSubshell({});
      const reply = await future.done;
      const subshellId = (reply.content as any).subshell_id as
        | string
        | undefined;

      if (!subshellId) {
        return kernel;
      }

      // Clone a connection and route execution to that subshell.
      const subshellKernel = kernel.clone({ handleComms: false });
      subshellKernel.subshellId = subshellId;

      return subshellKernel;
    } catch (e) {
      // Fallback to main kernel on any error.
      console.warn(
        '[variable-inspector] Subshell creation failed, using main kernel.',
        e
      );
      return kernel;
    }
  })();

  subshellByKernelId.set(kernel.id, created);
  return created;
}

export function resetVariableInspectorSubshell(): void {
  subshellByKernelId.clear();
}
