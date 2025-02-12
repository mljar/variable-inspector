import { ReactWidget } from '@jupyterlab/apputils'
import React from 'react'
import { VariablePanel } from './variablePanel';
import { NotebookPanel } from '@jupyterlab/notebook';

interface VariablePanelWidgetProps {
  variableName: string;
  variableType: string;
  variableData: any[];
  notebookPanel: NotebookPanel;
}

export class VariablePanelWidget extends ReactWidget {
  constructor(private props: VariablePanelWidgetProps) {
    super();
    this.update();
  }

  protected render(): JSX.Element {
    return (
      <div style={{ height: '100%', width: '100%'}}>
      <VariablePanel variableName={this.props.variableName}
        variableType={this.props.variableType}
        variableData={this.props.variableData}
        notebookPanel={this.props.notebookPanel}
        />
      </div>
    )
  }


}
