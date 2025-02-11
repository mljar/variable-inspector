// src/components/variableInspectorSidebarWidget.tsx
import React from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { Message } from '@lumino/messaging';
import { pluginIcon } from '../icons/pluginIcon';
import { NotebookWatcher } from '../watchers/notebookWatcher';
import { CommandRegistry } from '@lumino/commands';
import { NotebookPanelContextProvider } from '../context/notebookPanelContext';
import { NotebookKernelContextProvider } from '../context/notebookKernelContext';
import { VariableContextProvider } from '../context/notebookVariableContext';
import { VariableListComponent } from './variableListComponent';
import {
  PluginVisibilityContextValue,
  PluginVisibilityContext
} from '../context/pluginVisibilityContext';
import { KernelIdleWatcherContextProvider } from '../context/kernelStatusContext';
import { ILabShell } from '@jupyterlab/application';

export class VariableInspectorSidebarWidget extends ReactWidget {
  private notebookWatcher: NotebookWatcher;
  private commands: CommandRegistry;
  private isOpen = false;
  private labShell: ILabShell;

  constructor(
    notebookWatcher: NotebookWatcher,
    commands: CommandRegistry,
    labShell: ILabShell
  ) {
    super();
    this.notebookWatcher = notebookWatcher;
    this.commands = commands;
    this.id = 'my-plugin::empty-sidebar';
    this.title.icon = pluginIcon;
    this.title.caption = 'Variable Inspector';
    this.addClass('mljar-plugin-sidebar-widget');
    this.labShell = labShell;
  }

  protected onAfterShow(msg: Message): void {
    super.onAfterShow(msg);
    this.isOpen = true;
    this.update();
  }

  protected onAfterHide(msg: Message): void {
    super.onAfterHide(msg);
    this.isOpen = false;
    this.update();
  }

  render(): JSX.Element {
    const contextValue: PluginVisibilityContextValue = {
      isPluginOpen: this.isOpen,
      setPluginOpen: open => {
        this.isOpen = open;
        this.update();
      }
    };

    return (
      <PluginVisibilityContext.Provider value={contextValue}>
        <NotebookPanelContextProvider notebookWatcher={this.notebookWatcher}>
          <NotebookKernelContextProvider notebookWatcher={this.notebookWatcher}>
            <VariableContextProvider>
              <KernelIdleWatcherContextProvider>
                <VariableListComponent
                  commands={this.commands}
                  labShell={this.labShell}
                />
              </KernelIdleWatcherContextProvider>
            </VariableContextProvider>
          </NotebookKernelContextProvider>
        </NotebookPanelContextProvider>
      </PluginVisibilityContext.Provider>
    );
  }
}

export function createVariableInspectorSidebar(
  notebookWatcher: NotebookWatcher,
  commands: CommandRegistry,
  labShell: ILabShell
): VariableInspectorSidebarWidget {
  return new VariableInspectorSidebarWidget(notebookWatcher, commands, labShell);
}
