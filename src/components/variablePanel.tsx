import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  MultiGrid as RVMultiGrid,
  AutoSizer as RVAutoSizer
} from 'react-virtualized';
import 'react-virtualized/styles.css';
import { allowedTypes } from '../utils/allowedTypes';
import { NotebookPanel } from '@jupyterlab/notebook';
import { executeMatrixContent } from '../utils/executeGetMatrix';
import { useVariableRefeshContext } from '../context/variableRefershContext';
import { withIgnoredPanelKernelUpdates } from '../utils/kernelOperationNotifier';
import { useThemeContext } from '../context/themeContext';
import { transformMatrixData } from '../utils/utils';
import { PaginationControls } from './paginationControls';

interface IVariablePanelProps {
  variableName: string;
  initVariableType: string;
  initVariableShape: string;
  notebookPanel?: NotebookPanel | null;
}

const AutoSizer = RVAutoSizer as unknown as React.ComponentType<any>;
const MultiGrid = RVMultiGrid as unknown as React.ComponentType<any>;

export const VariablePanel: React.FC<IVariablePanelProps> = ({
  variableName,
  initVariableType,
  initVariableShape,
  notebookPanel
}) => {
  const [variableShape, setVariableShape] = useState(initVariableShape);
  const [variableType, setVariableType] = useState(initVariableType);
  const { isDark } = useThemeContext();
  const maxRowsRange = 100;
  const maxColsRange = 50;
  const [matrixData, setMatrixData] = useState<any[][]>([]);
  const { refreshCount } = useVariableRefeshContext();
  const [currentRow, setCurrentRow] = useState(0);
  const [currentColumn, setCurrentColumn] = useState(0);
  const [returnedSize, setReturnedSize] = useState<any[]>([]);
  const [rowInput, setRowInput] = useState(currentRow.toString());
  const [columnInput, setColumnInput] = useState(currentColumn.toString());
  const [rowsCount, setRowsCount] = useState(parseDimensions(variableShape)[0]);
  const [colsCount, setColsCount] = useState(parseDimensions(variableShape)[1]);
  const [autoSizerKey, setAutoSizerKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellRowInput, setCellRowInput] = useState('');
  const [cellColumnInput, setCellColumnInput] = useState('');
  const [gotoCell, setGotoCell] = useState<{
    row: number;
    column: number;
  } | null>(null);
  const [highlightCell, setHighlightCell] = useState<{
    row: number;
    column: number;
  } | null>(null);

  const fetchMatrixData = useCallback(async () => {
    try {
      if (!notebookPanel) {
        return;
      }

      const result = await withIgnoredPanelKernelUpdates(() =>
        executeMatrixContent(
          variableName,
          currentColumn,
          currentColumn + maxColsRange > colsCount
            ? colsCount
            : currentColumn + maxColsRange,
          currentRow,
          currentRow + maxRowsRange > rowsCount
            ? rowsCount
            : currentRow + maxRowsRange,

          notebookPanel
        )
      );
      setVariableShape(result.variableShape);
      setVariableType(result.variableType);
      setReturnedSize(result.returnedSize);
      setMatrixData(result.content);
    } catch (error) {
      console.error('Error fetching matrix content:', error);
    }
  }, [
    notebookPanel,
    variableName,
    currentColumn,
    currentRow,
    maxColsRange,
    maxRowsRange,
    withIgnoredPanelKernelUpdates,
    executeMatrixContent,
    setVariableShape,
    setVariableType,
    setReturnedSize,
    setMatrixData,
    variableType,
    returnedSize
  ]);

  useEffect(() => {
    setRowInput(currentRow.toString());
  }, [currentRow]);

  useEffect(() => {
    setColumnInput(currentColumn.toString());
  }, [currentColumn]);

  useEffect(() => {
    fetchMatrixData();
    const [rows, cols] = parseDimensions(variableShape);
    setRowsCount(rows);
    setColsCount(cols);
  }, [refreshCount]);

  useEffect(() => {
    fetchMatrixData();
  }, [currentRow, currentColumn]);

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          void entry;
          setAutoSizerKey(prev => prev + 1);
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  const handlePrevRowPage = (value: string) => {
    if (value === 'previous') {
      if (currentRow > maxRowsRange - 1) {
        setCurrentRow(currentRow - maxRowsRange);
      } else {
        setCurrentRow(0);
      }
    }
    if (value === 'first') {
      setCurrentRow(0);
    }
  };

  const handleNextRowPage = (value: string) => {
    if (rowsCount > maxRowsRange) {
      if (value === 'next') {
        if (currentRow + 2 * maxRowsRange < rowsCount) {
          setCurrentRow(currentRow + maxRowsRange);
        } else {
          setCurrentRow(rowsCount - maxRowsRange);
        }
      }
      if (value === 'last') {
        setCurrentRow(rowsCount - maxRowsRange);
      }
    } else {
      setCurrentRow(0);
    }
  };

  const handlePrevColumnPage = (value: string) => {
    if (value === 'previous') {
      if (currentColumn > maxColsRange - 1) {
        setCurrentColumn(currentColumn - maxColsRange);
      } else {
        setCurrentColumn(0);
      }
    }
    if (value === 'first') {
      setCurrentColumn(0);
    }
  };

  const handleNextColumnPage = (value: string) => {
    if (colsCount > maxColsRange) {
      if (value === 'next') {
        if (currentColumn + 2 * maxColsRange < colsCount) {
          setCurrentColumn(currentColumn + maxColsRange);
        } else {
          setCurrentColumn(colsCount - maxColsRange);
        }
      }
      if (value === 'last') {
        setCurrentColumn(colsCount - maxColsRange);
      }
    } else {
      setCurrentColumn(0);
    }
  };

  function parseDimensions(input: string): [number, number] {
    const regex2D = /^(-?\d+)\s*x\s*(-?\d+)$/;
    const match2D = input.match(regex2D);
    if (match2D) {
      const a = parseInt(match2D[1], 10);
      const b = parseInt(match2D[2], 10);
      return [a, b];
    }
    const regex1D = /^-?\d+$/;
    if (input.match(regex1D)) {
      const n = parseInt(input, 10);
      return [n, 1];
    }
    throw new Error('Wrong format');
  }

  const { data, fixedRowCount, fixedColumnCount } = transformMatrixData(
    matrixData,
    variableType,
    currentRow,
    currentColumn
  );

  const rowCount = data.length;
  const colCount = data[0]?.length || 0;

  const columnWidths: number[] = [];
  for (let col = 0; col < colCount; col++) {
    let maxLength = 0;
    for (let row = 0; row < rowCount; row++) {
      const cell = data[row][col];
      const cellStr = cell !== null ? cell.toString() : '';
      if (cellStr.length > maxLength) {
        maxLength = cellStr.length;
      }
    }
    columnWidths[col] = maxLength * 7 + 16;
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
      border: `1px solid ${isDark ? '#444' : '#ddd'}`,
      fontSize: '0.75rem',
      padding: '2px',
      color: isDark ? '#ddd' : '#000',
      background: isDark
        ? rowIndex % 2 === 0
          ? '#333'
          : '#222'
        : rowIndex % 2 === 0
          ? '#fafafa'
          : '#fff'
    };

    if (
      highlightCell &&
      rowIndex === highlightCell.row &&
      columnIndex === highlightCell.column
    ) {
      cellStyle = {
        ...cellStyle,
        border: '2px solid #0099cc'
      };
    }

    if (rowIndex === 0 || columnIndex === 0) {
      cellStyle = {
        ...cellStyle,
        background: isDark ? '#555' : '#e0e0e0',
        fontWeight: 'bold',
        textAlign: 'center'
      };
    }

    return (
      <div key={key} style={cellStyle}>
        {typeof cellData === 'boolean'
          ? cellData
            ? 'True'
            : 'False'
          : cellData}
      </div>
    );
  };

  const handleGotoCell = () => {
    const targetGlobalRow = parseInt(cellRowInput, 10);
    const targetGlobalCol = parseInt(cellColumnInput, 10);
    if (
      !isNaN(targetGlobalRow) &&
      targetGlobalRow >= 0 &&
      !isNaN(targetGlobalCol) &&
      targetGlobalCol >= 0
    ) {
      const newRowPage = Math.floor(targetGlobalRow / maxRowsRange) + 1;
      const newColPage = Math.floor(targetGlobalCol / maxColsRange) + 1;
      setRowInput(newRowPage.toString());
      setColumnInput(newColPage.toString());
      const localRow = targetGlobalRow - (newRowPage - 1) * maxRowsRange;
      const localCol = targetGlobalCol - (newColPage - 1) * maxColsRange;
      const gridRow = fixedRowCount + localRow;
      const gridCol = fixedColumnCount + localCol;
      setCurrentRow(newRowPage);
      setCurrentColumn(newColPage);
      setTimeout(() => {
        setGotoCell({ row: gridRow, column: gridCol });
        setHighlightCell({ row: gridRow, column: gridCol });
        setTimeout(() => {
          setHighlightCell(null);
        }, 2000);
      }, 500);
    }
  };

  if (!allowedTypes.includes(variableType)) {
    return (
      <div
        style={{
          padding: '10px',
          fontSize: '16px',
          height: '100%',
          background: isDark ? '#222' : '#fff',
          color: isDark ? '#ddd' : '#000'
        }}
      >
        <p>Wrong variable type: {variableType}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mljar-variable-inspector-pagination-container"
      style={{
        height: '100%',
        background: isDark ? '#222' : '#fff',
        color: isDark ? '#ddd' : '#000'
      }}
    >
      <div style={{ height: '90%' }}>
        {/* Grid */}
        <AutoSizer key={autoSizerKey}>
          {({ width, height }: { width: number; height: number }) => (
            <MultiGrid
              fixedRowCount={fixedRowCount}
              fixedColumnCount={fixedColumnCount}
              cellRenderer={cellRenderer}
              columnCount={colCount}
              columnWidth={({ index }: { index: number }) =>
                columnWidths[index]
              }
              rowHeight={20}
              height={height}
              rowCount={rowCount}
              width={width}
              scrollToRow={gotoCell ? gotoCell.row : undefined}
              scrollToColumn={gotoCell ? gotoCell.column : undefined}
              styleTopLeftGrid={{ background: isDark ? '#555' : '#e0e0e0' }}
              styleTopRightGrid={{ background: isDark ? '#555' : '#e0e0e0' }}
              styleBottomLeftGrid={{ background: isDark ? '#222' : '#fff' }}
              styleBottomRightGrid={{ background: isDark ? '#222' : '#fff' }}
            />
          )}
        </AutoSizer>
      </div>
      <div>
        {/* pagination */}
        <PaginationControls
          rowsCount={rowsCount}
          colsCount={colsCount}
          rowInput={rowInput}
          setRowInput={setRowInput}
          currentRow={currentRow}
          setCurrentRow={setCurrentRow}
          columnInput={columnInput}
          setColumnInput={setColumnInput}
          currentColumn={currentColumn}
          setCurrentColumn={setCurrentColumn}
          cellRowInput={cellRowInput}
          setCellRowInput={setCellRowInput}
          cellColumnInput={cellColumnInput}
          setCellColumnInput={setCellColumnInput}
          handleGotoCell={handleGotoCell}
          handlePrevRowPage={handlePrevRowPage}
          handleNextRowPage={handleNextRowPage}
          handlePrevColumnPage={handlePrevColumnPage}
          handleNextColumnPage={handleNextColumnPage}
        />
      </div>
    </div>
  );
};
