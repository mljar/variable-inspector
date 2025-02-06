import { ReactWidget } from '@jupyterlab/apputils'
import React from 'react'
import { VariablePanel } from './variablePanel';

interface VariablePanelWidgetProps {
  variableName: string;
  variableType: string;
  variableData: any[];
}

export class VariablePanelWidget extends ReactWidget {
  constructor(private props: VariablePanelWidgetProps) {
    super();
    this.update();
  }

  protected render(): JSX.Element {
    return (
      <VariablePanel variableName={this.props.variableName}
        variableType={this.props.variableType}
        variableData={this.props.variableData}/>
    )
  }


}
