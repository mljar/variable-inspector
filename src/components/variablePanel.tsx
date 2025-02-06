import React from 'react';
import {
  MultiGrid as RVMultiGrid,
  AutoSizer as RVAutoSizer
} from 'react-virtualized';
import 'react-virtualized/styles.css';

interface VariablePanelProps {
  variableName: string;
  variableType: string;
  // Zakładamy, że variableData to tablica wierszy, gdzie każdy wiersz to tablica komórek
  variableData: any[][];
}

// Podwójne rzutowanie: najpierw na unknown, potem na React.ComponentType<any>
const AutoSizer = (RVAutoSizer as unknown) as React.ComponentType<any>;
const MultiGrid = (RVMultiGrid as unknown) as React.ComponentType<any>;

export const VariablePanel: React.FC<VariablePanelProps> = ({
  variableName,
  variableType,
  variableData
}) => {
  console.log(variableName, variableType);

  const rowCount = variableData.length;
  const colCount = variableData[0]?.length || 0;

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
    return (
      <div
        key={key}
        style={{
          ...style,
          boxSizing: 'border-box',
          border: '1px solid #ddd',
          padding: '4px',
          background: rowIndex % 2 === 0 ? '#fafafa' : '#fff'
        }}
      >
        {variableData[rowIndex][columnIndex]}
      </div>
    );
  };

  return (
    <div style={{ padding: '10px', fontSize: '16px', height: '100%' }}>
      <AutoSizer>
        {({ width, height }: { width: number; height: number }) => (
          <MultiGrid
            fixedColumnCount={2}  // Dwie pierwsze kolumny zawsze widoczne
            fixedRowCount={0}
            cellRenderer={cellRenderer}
            columnCount={colCount}
            columnWidth={100}
            height={height}
            rowCount={rowCount}
            rowHeight={40}
            width={width}
            styleTopLeftGrid={{ background: '#f7f7f7' }}
            styleTopRightGrid={{ background: '#f7f7f7' }}
            styleBottomLeftGrid={{ background: '#fff' }}
            styleBottomRightGrid={{ background: '#fff' }}
          />
        )}
      </AutoSizer>
    </div>
  );
};
