import React from 'react';
import { skipLeftIcon } from '../icons/skipLeftIcon';
import { smallSkipLeftIcon } from '../icons/smallSkipLeftIcon';
import { smallSkipRightIcon } from '../icons/smallSkipRightIcon';
import { skipRightIcon } from '../icons/skipRightIcon';
// import { gridScanIcon } from '../icons/gridScanIcon';

interface PaginationControlsProps {
  rowsCount: number;
  colsCount: number;
  rowInput: string;
  setRowInput: (value: string) => void;
  currentRow: number;
  setCurrentRow: (value: number) => void;
  columnInput: string;
  setColumnInput: (value: string) => void;
  currentColumn: number;
  setCurrentColumn: (value: number) => void;
  cellRowInput: string;
  setCellRowInput: (value: string) => void;
  cellColumnInput: string;
  setCellColumnInput: (value: string) => void;
  handleGotoCell: () => void;
  handlePrevRowPage: (value: string) => void;
  handleNextRowPage: (value: string) => void;
  handlePrevColumnPage: (value: string) => void;
  handleNextColumnPage: (value: string) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  rowsCount,
  colsCount,
  rowInput,
  setRowInput,
  currentRow,
  setCurrentRow,
  columnInput,
  setColumnInput,
  currentColumn,
  setCurrentColumn,
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
    <div className="mljar-variable-inspector-pagination-container">
      <div className="mljar-variable-inspector-pagination-item">
        <div className="mljar-variable-inspector-choose-range">
          <span>Rows from </span>
          <button
            onClick={e => handlePrevRowPage('first')}
            className="mljar-variable-inspector-skip-button"
            title={'Display first 100 rows'}
          >
            <skipLeftIcon.react className="mljar-variable-inspector-skip-icon" />
          </button>
          <button
            onClick={e => handlePrevRowPage('previous')}
            className="mljar-variable-inspector-skip-button"
            title={'Display previous 100 rows'}
          >
            <smallSkipLeftIcon.react className="mljar-variable-inspector-skip-icon" />
          </button>
          <input
            title={'Start with row'}
            type="number"
            min={0}
            max={rowsCount - 1}
            value={rowInput === '' ? (rowInput = '0') : rowInput}
            className="mljar-variable-inspector-pagination-input"
            onChange={e => setRowInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const newPage = parseInt(rowInput, 10);
                if (!isNaN(newPage) && newPage >= 0 && newPage <= rowsCount) {
                  setCurrentRow(newPage);
                  setRowInput(newPage.toString());
                }
              }
            }}
            onBlur={() => {
              const newPage = parseInt(rowInput, 10);
              if (isNaN(newPage) || newPage < 0 || newPage > rowsCount) {
                setRowInput(currentRow.toString());
              } else {
                setCurrentRow(newPage);
              }
            }}
          />
          <span>to </span>
          <span>
            {parseInt(rowInput) + 99 >= rowsCount
              ? rowsCount - 1
              : parseInt(rowInput) + 99}
          </span>
          <button
            onClick={e => handleNextRowPage('next')}
            className="mljar-variable-inspector-skip-button"
            title={'Display next 100 rows'}
          >
            <smallSkipRightIcon.react className="mljar-variable-inspector-skip-icon" />
          </button>
          <button
            onClick={e => handleNextRowPage('last')}
            className="mljar-variable-inspector-skip-button"
            title={'Display last 100 rows'}
          >
            <skipRightIcon.react className="mljar-variable-inspector-skip-icon" />
          </button>
          <span>
            Total <span style={{ fontWeight: 600 }}>{rowsCount}</span> rows
          </span>
        </div>
        <div className="mljar-variable-inspector-choose-range">
          <span>Columns from </span>
          <button
            onClick={e => handlePrevColumnPage('first')}
            className="mljar-variable-inspector-skip-button"
            title={'Display first 50 columns'}
          >
            <skipLeftIcon.react className="mljar-variable-inspector-skip-icon" />
          </button>
          <button
            onClick={e => handlePrevColumnPage('previous')}
            className="mljar-variable-inspector-skip-button"
            title={'Display previous 50 columns'}
          >
            <smallSkipLeftIcon.react className="mljar-variable-inspector-skip-icon" />
          </button>
          <input
            title={'Start with column'}
            type="number"
            min={0}
            max={colsCount - 1}
            value={columnInput === '' ? (columnInput = '0') : columnInput}
            className="mljar-variable-inspector-pagination-input"
            onChange={e => setColumnInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const newPage = parseInt(columnInput, 10);
                if (!isNaN(newPage) && newPage >= 0 && newPage <= colsCount) {
                  setCurrentColumn(newPage);
                  setColumnInput(newPage.toString());
                }
              }
            }}
            onBlur={() => {
              const newPage = parseInt(columnInput, 10);
              if (isNaN(newPage) || newPage < 0 || newPage > colsCount) {
                setColumnInput(currentColumn.toString());
              } else {
                setCurrentColumn(newPage);
              }
            }}
          />
          <span>to </span>
          <span>
            {parseInt(columnInput) + 49 >= colsCount
              ? colsCount - 1
              : parseInt(columnInput) + 49}
          </span>
          <button
            onClick={e => handleNextColumnPage('next')}
            className="mljar-variable-inspector-skip-button"
            title={'Display next 50 columns'}
          >
            <smallSkipRightIcon.react className="mljar-variable-inspector-skip-icon" />
          </button>
          <button
            onClick={e => handleNextColumnPage('last')}
            className="mljar-variable-inspector-skip-button"
            title={'Display last 50 columns'}
          >
            <skipRightIcon.react className="mljar-variable-inspector-skip-icon" />
          </button>
          <span>
            Total <span style={{ fontWeight: 600 }}>{colsCount}</span> columns
          </span>
        </div>
        {/* Goto Cell section */}
        {/* <div className="mljar-variable-inspector-choose-range">
          <span>Goto cell: </span>
          <input
            type="number"
            placeholder="Row"
            value={cellRowInput}
            className="mljar-variable-inspector-pagination-input"
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
            className="mljar-variable-inspector-pagination-input"
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
          <button
            onClick={handleGotoCell}
            className="mljar-variable-inspector-skip-button"
          >
            <gridScanIcon.react className="mljar-variable-inspector-skip-icon" />
          </button>
        </div> */}
      </div>
    </div>
  );
};
