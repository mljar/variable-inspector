# Kernel data shared by MLJAR extensions

`@mljar/kernel-data` defines the shared `IKernelData` token and the in-memory service bundled with Variables Explorer. Installing `variable-inspector` installs the provider; there is no separate Python package to install or publish.

Variables Explorer owns the provider plugin (`variable-inspector:kernel-data`). Package Manager, Piece of Code, and AI request its token through JupyterLab's `optional` dependencies. They receive the shared service when Variables Explorer is enabled, or `null` when it is absent. Package Manager continues to inspect packages locally; recipes and AI omit shared context when unavailable.

Snapshots are isolated by kernel ID, cleared on restart/disposal, and never persisted. The provider uses `IStateDB` only to remove the five legacy runtime keys after workspace restoration. Other workspace state is preserved.

All extensions import the token through `@mljar/kernel-data` and configure it as a strict singleton. Their bundles include a fallback copy of the API so optional activation works without Variables Explorer; only Variables Explorer registers the service provider. The retired standalone provider plugin is disabled when Variables Explorer is installed.

Run `jlpm build:lib` or `jlpm build:prod` from the Variables Explorer repository to build the API and extension. Consumer repositories reference `variable-inspector/packages/kernel-data` during development. Build Variables Explorer first, then run `jlpm install` and build each consumer.
