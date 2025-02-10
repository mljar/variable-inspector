import React from 'react';
import {
  MultiGrid as RVMultiGrid,
  AutoSizer as RVAutoSizer
} from 'react-virtualized';
import 'react-virtualized/styles.css';

interface VariablePanelProps {
  variableName: string;
  variableType: string;
  variableData: any[][];
}

const AutoSizer = (RVAutoSizer as unknown) as React.ComponentType<any>;
const MultiGrid = (RVMultiGrid as unknown) as React.ComponentType<any>;

function transpose<T>(matrix: T[][]): T[][] {
    return matrix[0].map((_, colIndex) => matrix.map((row: T[]) => row[colIndex]));
}


export const VariablePanel: React.FC<VariablePanelProps> = ({
  variableName,
  variableType,
  variableData
}) => {
  console.log(variableName, variableType);



 let data2D: any[][] = [];
  if (variableData.length > 0 && !Array.isArray(variableData[0])) {
    data2D = (variableData as any[]).map(item => [item]);
  } else {
    data2D = variableData as any[][];
  }

  let data: any[][] = data2D;
  let fixedRowCount = 0;
  let fixedColumnCount = 0;
  const variableTypes = ["ndarray","DataFrame","list","Series"];

  if (variableTypes.includes(variableType) && data2D.length > 0 && data2D.length > 0) {
    const headerRow = ['index'];

    let length = (variableType === "DataFrame")? (data2D[0].length - 1) : data2D[0].length;

    for (let j = 0; j < length; j++) {
      headerRow.push(j.toString());
    }

    let newData = [headerRow];
    for (let i = 0; i < data2D.length; i++) {
      if(variableType == "DataFrame"){
                 
      newData.push([...data2D[i]]);
      }
      else{
      newData.push([i, ...data2D[i]]);
      }
    }

    if(variableType == 'DataFrame'){
      newData = transpose(newData);
    }
    
    data2D = transpose(data2D);
    data = newData;
    fixedRowCount = 1;    
    fixedColumnCount = 1;
  }

  const rowCount = data.length;
  const colCount = data[0]?.length || 0;

  const cellRenderer = ({
    columnIndex,
    key,
    rowIndex,
    style
  }: {
    columnIndex: number;
    key: string;
    rowIndex: number;
    style: React.CSSProperties;
  }) => {
    const cellData = data[rowIndex][columnIndex];
    let cellStyle: React.CSSProperties = {
      ...style,
      boxSizing: 'border-box',
      border: '1px solid #ddd',
      fontSize: "0.65rem",
      padding: '1px'
    };

    if (rowIndex === 0 || columnIndex === 0) {
      cellStyle = {
        ...cellStyle,
        background: '#e0e0e0',
        fontWeight: 'bold',
        fontSize: "0.65rem",
        textAlign: 'center',
        padding: '1px'
      };
    } else {
      cellStyle.background = rowIndex % 2 === 0 ? '#fafafa' : '#fff';
    }

    return (
      <div key={key} style={cellStyle}>
        {cellData}
      </div>
    );
  };

  return (
    <div style={{ padding: '10px', fontSize: '16px', height: '100%' }}>
      <AutoSizer>
        {({ width, height }: { width: number; height: number }) => (
          <MultiGrid
            fixedRowCount={fixedRowCount}
            fixedColumnCount={fixedColumnCount}
            cellRenderer={cellRenderer}
            columnCount={colCount}
            columnWidth={60}
            rowHeight={20}
            height={height}
            rowCount={rowCount}
            width={width}
            styleTopLeftGrid={{ background: '#e0e0e0' }}
            styleTopRightGrid={{ background: '#e0e0e0' }}
            styleBottomLeftGrid={{ background: '#fff' }}
            styleBottomRightGrid={{ background: '#fff' }}
          />
        )}
      </AutoSizer>
    </div>
  );
};
