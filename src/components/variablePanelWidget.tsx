import { ReactWidget } from '@jupyterlab/apputils';
import React from 'react';
import { VariablePanel } from './variablePanel';
import { NotebookPanel } from '@jupyterlab/notebook';
import { VariableRefreshContextProvider } from '../context/variableRefershContext';
import { ThemeContextProvider } from '../context/themeContext';

export interface VariablePanelWidgetProps {
  variableName: string;
  variableType: string;
  variableShape: string;
  notebookPanel?: NotebookPanel | null;
}

export class VariablePanelWidget extends ReactWidget {
  constructor(private props: VariablePanelWidgetProps) {
    super();
    this.update();
  }

  protected render(): JSX.Element {
    return (
      <div style={{ height: '100%', width: '100%' }}>
        <VariableRefreshContextProvider
          notebookPanel={this.props.notebookPanel}
        >
        <ThemeContextProvider>
          <VariablePanel
            variableName={this.props.variableName}
            initVariableType={this.props.variableType}
            initVariableShape={this.props.variableShape}
            notebookPanel={this.props.notebookPanel}
          />
          </ThemeContextProvider>
        </VariableRefreshContextProvider>
      </div>
    );
  }
}
