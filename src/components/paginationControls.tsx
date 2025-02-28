import React from 'react';
import { skipLeftIcon } from '../icons/skipLeftIcon';
import { skipRightIcon } from '../icons/skipRightIcon';
import { gridScanIcon } from '../icons/gridScanIcon';

interface PaginationControlsProps {
  rowPageInput: string;
  setRowPageInput: (value: string) => void;
  currentRowPage: number;
  setCurrentRowPage: (value: number) => void;
  maxRowPage: number;
  columnPageInput: string;
  setColumnPageInput: (value: string) => void;
  currentColumnPage: number;
  setCurrentColumnPage: (value: number) => void;
  maxColumnPage: number;
  cellRowInput: string;
  setCellRowInput: (value: string) => void;
  cellColumnInput: string;
  setCellColumnInput: (value: string) => void;
  handleGotoCell: () => void;
  handlePrevRowPage: () => void;
  handleNextRowPage: () => void;
  handlePrevColumnPage: () => void;
  handleNextColumnPage: () => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  rowPageInput,
  setRowPageInput,
  currentRowPage,
  setCurrentRowPage,
  maxRowPage,
  columnPageInput,
  setColumnPageInput,
  currentColumnPage,
  setCurrentColumnPage,
  maxColumnPage,
  cellRowInput,
  setCellRowInput,
  cellColumnInput,
  setCellColumnInput,
  handleGotoCell,
  handlePrevRowPage,
  handleNextRowPage,
  handlePrevColumnPage,
  handleNextColumnPage
}) => {
  return (
    <div className="mljar-variable-inspector-grid-header" style={{ height: '6%' }}>
      <div className="mljar-variable-inspector-grid-item">
        <button onClick={handlePrevRowPage} className="mljar-variable-inspector-skip-button">
          <skipLeftIcon.react className="mljar-variable-inspector-skip-icon" />
        </button>
        <input
          type="number"
          value={rowPageInput}
          className="mljar-variable-inspector-grid-input"
          onChange={e => setRowPageInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const newPage = parseInt(rowPageInput, 10);
              if (!isNaN(newPage) && newPage >= 1 && newPage <= maxRowPage) {
                setCurrentRowPage(newPage);
                setRowPageInput(newPage.toString());
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
        <button onClick={handleNextRowPage} className="mljar-variable-inspector-skip-button">
          <skipRightIcon.react className="mljar-variable-inspector-skip-icon" />
        </button>
        <button onClick={handlePrevColumnPage} className="mljar-variable-inspector-skip-button">
          <skipLeftIcon.react className="mljar-variable-inspector-skip-icon" />
        </button>
        <input
          type="number"
          value={columnPageInput}
          className="mljar-variable-inspector-grid-input"
          onChange={e => setColumnPageInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const newPage = parseInt(columnPageInput, 10);
              if (!isNaN(newPage) && newPage >= 1 && newPage <= maxColumnPage) {
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
        <button onClick={handleNextColumnPage} className="mljar-variable-inspector-skip-button">
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
              if (isNaN(newVal) || newVal < 0) {
                setCellRowInput('0');
              } else {
                handleGotoCell();
              }
            }
          }}
          onBlur={() => {
            const newVal = parseInt(cellRowInput, 10);
            if (isNaN(newVal) || newVal < 0) {
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
              if (isNaN(newVal) || newVal < 0) {
                setCellColumnInput('0');
              } else {
                handleGotoCell();
              }
            }
          }}
          onBlur={() => {
            const newVal = parseInt(cellColumnInput, 10);
            if (isNaN(newVal) || newVal < 0) {
              setCellColumnInput('0');
            }
          }}
        />
        <button onClick={handleGotoCell} className="mljar-variable-inspector-skip-button">
          <gridScanIcon.react className="mljar-variable-inspector-skip-icon" />
        </button>
      </div>
    </div>
  );
};
