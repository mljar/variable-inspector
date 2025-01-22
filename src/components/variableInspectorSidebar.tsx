import React from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { pluginIcon } from '../icons/pluginIcon';
import { NotebookWatcher } from '../watchers/notebookWatcher'
import { NotebookPanelContextProvider } from '../context/notebookPanelContext';


class VariableInspectorSidebarWidget extends ReactWidget {
  private notebookWatcher: NotebookWatcher;
  constructor(notebookWatcher:NotebookWatcher) {
    super();
    this.notebookWatcher = notebookWatcher;
    this.id = 'my-plugin::empty-sidebar';
    this.title.icon = pluginIcon;
    this.title.caption ='My Plugin';
    this.addClass('my-plugin-sidebar-widget');
  }

  render(): JSX.Element {
    return (
      <div
        className='sidebar-container'
      >
        Siema
        <NotebookPanelContextProvider notebookWatcher={this.notebookWatcher}>
        </NotebookPanelContextProvider>
      </div>
    );
  }
}

export function createVariableInspectorSidebar(notebookWatcher:NotebookWatcher): VariableInspectorSidebarWidget {
  return new VariableInspectorSidebarWidget(notebookWatcher);
}


