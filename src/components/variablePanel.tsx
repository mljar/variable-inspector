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
import { skipLeftIcon } from '../icons/skipLeftIcon';
import { skipRightIcon } from '../icons/skipRightIcon';
import { gridScanIcon } from '../icons/gridScanIcon'; 

interface VariablePanelProps {
  variableName: string;
  initVariableType: string;
  initVariableShape: string;
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
  initVariableType,
  initVariableShape,
  notebookPanel
}) => {
  const t = document.body.dataset?.jpThemeName;
  const [isDark, setIsDark] = useState(t !== undefined && t.includes('Dark'));
  const [variableShape, setVariableShape] = useState(initVariableShape);
  const [variableType, setVariableType] = useState(initVariableType);

  useEffect(() => {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'attributes') {
          if (
            document.body.attributes
              .getNamedItem('data-jp-theme-name')
              ?.value.includes('Dark')
          ) {
            setIsDark(true);
          } else {
            setIsDark(false);
          }
        }
      });
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-jp-theme-name']
    });
  }, []);

  const maxMatrixSize = 100;
  const [matrixData, setMatrixData] = useState<any[][]>([]);
  const { refreshCount } = useVariableRefeshContext();
  const [currentRowPage, setCurrentRowPage] = useState(1);
  const [currentColumnPage, setCurrentColumnPage] = useState(1);
  const [returnedSize, setReturnedSize] = useState<any[]>([]);
  const [maxRowPage, setMaxRowPage] = useState(
    getMaxPage(parseDimensions(variableShape)[0])
  );
  const [rowPageInput, setRowPageInput] = useState(currentRowPage.toString());
  const [columnPageInput, setColumnPageInput] = useState(
    currentColumnPage.toString()
  );
  const [maxColumnPage, setMaxColumnPage] = useState(
    getMaxPage(parseDimensions(variableShape)[1])
  );
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
  const headerSize = 50;
  void headerSize;

  const fetchMatrixData = useCallback(async () => {
    try {
      if (!notebookPanel) {
        return;
      }

      const result = await withIgnoredPanelKernelUpdates(() =>
        executeMatrixContent(
          variableName,
          (currentColumnPage - 1) * maxMatrixSize,
          currentColumnPage * maxMatrixSize,
          (currentRowPage - 1) * maxMatrixSize,
          currentRowPage * maxMatrixSize,
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
    currentColumnPage,
    currentRowPage,
    maxMatrixSize,
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
    setRowPageInput(currentRowPage.toString());
  }, [currentRowPage]);

  useEffect(() => {
    setColumnPageInput(currentColumnPage.toString());
  }, [currentColumnPage]);

  useEffect(() => {
    fetchMatrixData();
    const [rows, cols] = parseDimensions(variableShape);
    setMaxRowPage(getMaxPage(rows));
    setMaxColumnPage(getMaxPage(cols));
    setCurrentRowPage(1);
    setCurrentColumnPage(1);
  }, [refreshCount]);

  useEffect(() => {
    fetchMatrixData();
  }, [currentRowPage, currentColumnPage]);

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

  const handlePrevRowPage = () => {
    if (currentRowPage > 1) {
      setCurrentRowPage(currentRowPage - 1);
    }
  };

  const handleNextRowPage = () => {
    if (currentRowPage < maxRowPage) {
      setCurrentRowPage(currentRowPage + 1);
    }
  };

  const handlePrevColumnPage = () => {
    if (currentColumnPage > 1) {
      setCurrentColumnPage(currentColumnPage - 1);
    }
  };

  const handleNextColumnPage = () => {
    if (currentColumnPage < maxColumnPage) {
      setCurrentColumnPage(currentColumnPage + 1);
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

  function getMaxPage(pagesDataSize: number) {
    return Math.max(1, Math.ceil(pagesDataSize / maxMatrixSize));
  }

  let data2D: any[][] = [];
  if (matrixData.length > 0 && !Array.isArray(matrixData[0])) {
    data2D = (matrixData as any[]).map(item => [item]);
  } else {
    data2D = matrixData as any[][];
  }

  let data: any[][] = data2D;
  let fixedRowCount = 0;
  let fixedColumnCount = 0;

  if (allowedTypes.includes(variableType) && data2D.length > 0) {
    const globalColumnStart = (currentColumnPage - 1) * maxMatrixSize;
    const headerRow = ['index'];
    let length =
      variableType === 'DataFrame' ? data2D[0].length - 1 : data2D[0].length;

    for (let j = 0; j < length; j++) {
      headerRow.push((globalColumnStart + j).toString());
    }

    let newData = [headerRow];
    for (let i = 0; i < data2D.length; i++) {
      if (variableType === 'DataFrame') {
        newData.push([...data2D[i]]);
      } else {
        const globalIndex = (currentRowPage - 1) * maxMatrixSize + i;
        newData.push([globalIndex, ...data2D[i]]);
      }
    }

    if (variableType === 'DataFrame' || variableType === 'Series') {
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
        {cellData}
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
      const newRowPage = Math.floor(targetGlobalRow / maxMatrixSize) + 1;
      const newColPage = Math.floor(targetGlobalCol / maxMatrixSize) + 1;
      setRowPageInput(newRowPage.toString());
      setColumnPageInput(newColPage.toString());
      const localRow = targetGlobalRow - (newRowPage-1) * maxMatrixSize;
      const localCol = targetGlobalCol - (newColPage-1) * maxMatrixSize;
      const gridRow = fixedRowCount + localRow;
      const gridCol = fixedColumnCount + localCol;
      setCurrentRowPage(newRowPage);
      setCurrentColumnPage(newColPage);
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
      className="mljar-variable-inspector-grid-container"
      style={{
        height: '100%',
        background: isDark ? '#222' : '#fff',
        color: isDark ? '#ddd' : '#000'
      }}
    >
      {/* pagination */}
      <div
        className="mljar-variable-inspector-grid-header"
        style={{ height: '6%' }}
      >
        <div className="mljar-variable-inspector-grid-item">
          <button
            onClick={handlePrevRowPage}
            className="mljar-variable-inspector-skip-button"
          >
            <skipLeftIcon.react className="mljar-variable-inspector-skip-icon" />
          </button>
          <input
            type="number"
            value={rowPageInput}
            className="mljar-variable-inspector-grid-input"
            onChange={e => {
              setRowPageInput(e.target.value);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const newPage = parseInt(rowPageInput, 10);
                if (!isNaN(newPage) && newPage >= 1 && newPage <= maxRowPage) {
                  setCurrentRowPage(newPage);
                  setRowPageInput(currentRowPage.toString());
                }
              }
            }}
            onBlur={() => {
              const newPage = parseInt(rowPageInput, 10);
              if (isNaN(newPage) || newPage < 1 || newPage > maxRowPage) {
                setRowPageInput(currentRowPage.toString());
              } else {
                setCurrentRowPage(newPage);
              }
            }}
          />
          <span>/ {maxRowPage} (Rows)</span>
          <button
            onClick={handleNextRowPage}
            className="mljar-variable-inspector-skip-button"
          >
            <skipRightIcon.react className="mljar-variable-inspector-skip-icon" />
          </button>
          <button
            onClick={handlePrevColumnPage}
            className="mljar-variable-inspector-skip-button"
          >
            <skipLeftIcon.react className="mljar-variable-inspector-skip-icon" />
          </button>
          <input
            type="number"
            value={columnPageInput}
            className="mljar-variable-inspector-grid-input"
            onChange={e => {
              setColumnPageInput(e.target.value);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const newPage = parseInt(columnPageInput, 10);
                if (
                  !isNaN(newPage) &&
                  newPage >= 1 &&
                  newPage <= maxColumnPage
                ) {
                  setCurrentColumnPage(newPage);
                } else {
                  setColumnPageInput(currentColumnPage.toString());
                }
              }
            }}
            onBlur={() => {
              const newPage = parseInt(columnPageInput, 10);
              if (isNaN(newPage) || newPage < 1 || newPage > maxColumnPage) {
                setColumnPageInput(currentColumnPage.toString());
              } else {
                setCurrentColumnPage(newPage);
              }
            }}
          />
          <span>/ {maxColumnPage} (Columns)</span>
          <button
            onClick={handleNextColumnPage}
            className="mljar-variable-inspector-skip-button"
          >
            <skipRightIcon.react className="mljar-variable-inspector-skip-icon" />
          </button>
        </div>
        <div className="mljar-variable-inspector-grid-item">
          <span>Goto cell: </span>
          <input
            type="number"
            placeholder="Row"
            value={cellRowInput}
            className="mljar-variable-inspector-grid-input"
            onChange={e => setCellRowInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const newVal = parseInt(cellRowInput, 10);
                if (
                  isNaN(newVal) ||
                  newVal < 0 ||
                  newVal > parseDimensions(variableShape)[0]-1
                ) {
                  setCellRowInput('0');
                } else {
                  handleGotoCell();
                }
              }
            }}
            onBlur={() => {
              const newVal = parseInt(cellRowInput, 10);
              if (
                isNaN(newVal) ||
                newVal < 0 ||
                newVal > parseDimensions(variableShape)[0] - 1
              ) {
                setCellRowInput('0');
              }
            }}
          />
          <input
            type="number"
            placeholder="Column"
            value={cellColumnInput}
            className="mljar-variable-inspector-grid-input"
            onChange={e => setCellColumnInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const newVal = parseInt(cellColumnInput, 10);
                if (
                  isNaN(newVal) ||
                  newVal < 0 ||
                  newVal > parseDimensions(variableShape)[1]-1
                ) {
                  setCellColumnInput('0');
                } else {
                  handleGotoCell();
                }
              }
            }}
            onBlur={() => {
              const newVal = parseInt(cellColumnInput, 10);
              if (
                isNaN(newVal) ||
                newVal < 0 ||
                newVal > parseDimensions(variableShape)[1]-1
              ) {
                setCellColumnInput('0');
              }
            }}
          />
          <button onClick={handleGotoCell}
          className="mljar-variable-inspector-skip-button"
          >
              <gridScanIcon.react className="mljar-variable-inspector-skip-icon" />
          </button>
        </div>
      </div>
      <div style={{ height: '94%' }}>
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
    </div>
  );
};
