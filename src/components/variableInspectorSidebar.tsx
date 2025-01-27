import React from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { pluginIcon } from '../icons/pluginIcon';
import { NotebookWatcher } from '../watchers/notebookWatcher'
import { NotebookPanelContextProvider } from '../context/notebookPanelContext';
import { CommandRegistry } from '@lumino/commands';
import { VariableListComponent } from './variableListComponent';
import { NotebookKernelContextProvider } from '../context/notebookKernelContext';
import { VariableContextProvider } from '../context/notebookVariableContext';


class VariableInspectorSidebarWidget extends ReactWidget {
  private notebookWatcher: NotebookWatcher;
  private commands: CommandRegistry;
  constructor(notebookWatcher:NotebookWatcher, commands: CommandRegistry) {
    super();
    this.notebookWatcher = notebookWatcher;
    this.commands = commands;
    this.id = 'my-plugin::empty-sidebar';
    this.title.icon = pluginIcon;
    this.title.caption ='My Plugin';
    this.addClass('my-plugin-sidebar-widget');
  }

  render(): JSX.Element {
    return (
      <div
        className='mljar-sidebar-container'
      >

        <NotebookPanelContextProvider notebookWatcher={this.notebookWatcher}>
          <NotebookKernelContextProvider notebookWatcher={this.notebookWatcher}>
              <VariableContextProvider>
            <VariableListComponent/>
            <button
            onClick={() => this.commands.execute('custom:open-variable-inspector')}
            > 
              Hello
            </button> 
            </VariableContextProvider>
          </NotebookKernelContextProvider>
        </NotebookPanelContextProvider>
      </div>
    );
  }
}

export function createVariableInspectorSidebar(notebookWatcher: NotebookWatcher, commands: CommandRegistry): VariableInspectorSidebarWidget {
  return new VariableInspectorSidebarWidget(notebookWatcher, commands);
}


