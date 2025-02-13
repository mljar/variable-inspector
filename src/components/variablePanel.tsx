import React, { useEffect, useState } from 'react';
import {
  MultiGrid as RVMultiGrid,
  AutoSizer as RVAutoSizer
} from 'react-virtualized';
import 'react-virtualized/styles.css';
import { allowedTypes } from '../utils/allowedTypes';
import { NotebookPanel } from '@jupyterlab/notebook';
import { executeMatrixContent } from '../utils/executeGetMatrix';

interface VariablePanelProps {
  variableName: string;
  variableType: string;
  variableData: any[][];
  notebookPanel?: NotebookPanel | null;
}

const AutoSizer = RVAutoSizer as unknown as React.ComponentType<any>;
const MultiGrid = RVMultiGrid as unknown as React.ComponentType<any>;

function transpose<T>(matrix: T[][]): T[][] {
  return matrix[0].map((_, colIndex) =>
    matrix.map((row: T[]) => row[colIndex])
  );
}

export const VariablePanel: React.FC<VariablePanelProps> = ({
  variableName,
  variableType,
  variableData,
  notebookPanel,
}) => {

  const [matrixData, setMatrixData] = useState<any[][]>(variableData);

    useEffect(() => {
      async function fetchData() {
        try {
          if (!notebookPanel) {
            return;
          }
          const result = await executeMatrixContent(
            variableName,
            notebookPanel
          );
        console.log("aha32")
        setMatrixData(result.content);
        } catch (error) {
          console.error('Error fetching matrix content:', error);
        }
      }

      fetchData();
    }, [notebookPanel?.sessionContext.session?.kernel?.status]);

  let data2D: any[][] = [];
  if (matrixData.length > 0 && !Array.isArray(matrixData[0])) {
    data2D = (matrixData as any[]).map(item => [item]);
  } else {
    data2D = matrixData as any[][];
  }

  let data: any[][] = data2D;
  let fixedRowCount = 0;
  let fixedColumnCount = 0;

  if (
    allowedTypes.includes(variableType) &&
    data2D.length > 0 &&
    data2D.length > 0
  ) {
    const headerRow = ['index'];

    let length =
      variableType === 'DataFrame' ? data2D[0].length - 1 : data2D[0].length;

    for (let j = 0; j < length; j++) {
      headerRow.push(j.toString());
    }

    let newData = [headerRow];
    for (let i = 0; i < data2D.length; i++) {
      if (variableType == 'DataFrame') {
        newData.push([...data2D[i]]);
      } else {
        newData.push([i, ...data2D[i]]);
      }
    }

    if (variableType == 'DataFrame' || variableType == 'Series') {
      newData = transpose(newData);
    }

    data2D = transpose(data2D);
    data = newData;
    fixedRowCount = 1;
    fixedColumnCount = 1;
  }

  const rowCount = data.length;
  const colCount = data[0]?.length || 0;

  const columnWidths: number[] = [];
  for (let col = 0; col < colCount; col++) {
    let maxLength = 0;
    for (let row = 0; row < rowCount; row++) {
      const cell = data[row][col];
      const cellStr = cell != null ? cell.toString() : '';
      if (cellStr.length > maxLength) {
        maxLength = cellStr.length;
      }
    }
    columnWidths[col] = maxLength * 6 + 16;
  }

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
      fontSize: '0.65rem',
      padding: '1px'
    };


    if (rowIndex === 0 || columnIndex === 0) {
      cellStyle = {
        ...cellStyle,
        background: '#e0e0e0',
        fontWeight: 'bold',
        fontSize: '0.65rem',
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
            columnWidth={({ index }: { index: number }) => columnWidths[index]}
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
