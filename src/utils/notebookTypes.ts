import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';
import { Widget } from '@lumino/widgets';

export type NotebookLikeWidget =
  | DocumentWidget<Widget, DocumentRegistry.IModel>
  | null;
