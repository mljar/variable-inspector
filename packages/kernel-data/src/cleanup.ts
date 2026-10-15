/** Only obsolete runtime keys are removed; workspace/layout state is preserved. */
export const LEGACY_KEYS = [
  'mljarVariables',
  'mljarVariablesStatus',
  'mljarPackages',
  'mljarPackagesStatus',
  'mljarPackagesPanelId'
] as const;
export async function removeLegacyKernelData(state: {
  remove(id: string): Promise<void>;
}): Promise<void> {
  await Promise.all(LEGACY_KEYS.map(key => state.remove(key)));
}
