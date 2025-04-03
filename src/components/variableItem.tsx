import React, { useState, useEffect } from 'react';
import { detailIcon } from '../icons/detailIcon';
import { CommandRegistry } from '@lumino/commands';
import { executeMatrixContent } from '../utils/executeGetMatrix';
import { useNotebookPanelContext } from '../context/notebookPanelContext';
import { allowedTypes } from '../utils/allowedTypes';
import { ILabShell } from '@jupyterlab/application';
import { createEmptyVariableInspectorPanel } from '../components/variableInspectorPanel';

interface VariableInfo {
  name: string;
  type: string;
  shape: string;
  dimension: number;
  size: number;
  value: string;
}

interface VariableItemProps {
  vrb: VariableInfo;
  commands: CommandRegistry;
  labShell: ILabShell;
  showType: boolean;
  showShape: boolean;
  showSize: boolean;
}

export const VariableItem: React.FC<VariableItemProps> = ({
  vrb,
  commands,
  labShell,
  showType,
  showShape,
  showSize
}) => {
  const notebookPanel = useNotebookPanelContext();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  void previewLoading;
  const loadPreview = async (type: string) => {
    if (notebookPanel) {
      try {
        setPreviewLoading(true);
        const result = await executeMatrixContent(
          vrb.name,
          0,
          10,
          0,
          10,
          notebookPanel
        );
        const content = result.content;
        try {
          if (type === 'list') {
            let listLen = 10;
            try {
              listLen = parseInt(vrb.shape);
            } catch {
              /* empty */
            } finally {
              setPreview(`[${content}${listLen > 10 ? '...' : ''}]`);
            }
          }
          if (type === 'dict') {
            const jsonStr = JSON.stringify(content);
            const shortenedJsonStr = jsonStr.slice(0, -1) + ' ...}';
            setPreview(shortenedJsonStr);
          }
        } catch (e) {
          console.error('Failed to load conent');
          setPreview('failed to load content');
        }
      } catch (err) {
        console.error('Error fetching preview:', err);
      } finally {
        setPreviewLoading(false);
      }
    }
  };

  useEffect(() => {
    if (
      allowedTypes.includes(vrb.type) &&
      vrb.dimension === 1 &&
      vrb.type === 'list'
    ) {
      loadPreview('list');
    }
    if (vrb.type === 'dict') {
      loadPreview('dict');
    }
  }, [notebookPanel, vrb]);

  const handleButtonClick = async (
    variableName: string,
    variableType: string,
    variableShape: string
  ) => {
    if (notebookPanel) {
      try {
        const result = await executeMatrixContent(
          variableName,
          0,
          100,
          0,
          100,
          notebookPanel
        );
        const variableData = result.content;
        let isOpen = false;
        for (const widget of labShell.widgets('main')) {
          if (widget.id === `${variableType}-${variableName}`) {
            isOpen = true;
          }
        }
        if (variableData && !isOpen) {
          setLoading(true);
          createEmptyVariableInspectorPanel(
            labShell,
            variableName,
            variableType,
            variableShape,
            notebookPanel
          );
        }
      } catch (err) {
        console.error('unknown error', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <li
      className={`mljar-variable-inspector-item ${allowedTypes.includes(vrb.type) && vrb.dimension <= 2 && vrb.type !== 'list' && vrb.dimension !== 1 ? '' : 'small-value'}`}
    >
      <span className="mljar-variable-inspector-variable-name">{vrb.name}</span>
      {showType && <span className="mljar-variable-type">{vrb.type}</span>}
      {showShape && (
        <span className="mljar-variable-shape">
          {vrb.shape !== 'None' ? vrb.shape : ''}
        </span>
      )}
      {showSize && (
        <span className="mljar-variable-inspector-variable-size">
          {vrb.size}
        </span>
      )}
      {allowedTypes.includes(vrb.type) && vrb.dimension <= 2 ? (
        vrb.dimension === 1 && vrb.type === 'list' ? (
          <button
            className="mljar-variable-inspector-variable-preview"
            title={preview}
            onClick={() => handleButtonClick(vrb.name, vrb.type, vrb.shape)}
          >
            {preview}
          </button>
        ) : (
          <button
            className="mljar-variable-inspector-show-variable-button"
            onClick={() => handleButtonClick(vrb.name, vrb.type, vrb.shape)}
            aria-label={`Show details for ${vrb.name}`}
            title="Show value"
          >
            {loading ? (
              <div className="mljar-variable-spinner-big" />
            ) : (
              <detailIcon.react className="mljar-variable-detail-button-icon" />
            )}
          </button>
        )
      ) : vrb.type === 'dict' ? (
        <span
          className="mljar-variable-inspector-variable-value"
          title={preview}
        >
          {preview}
        </span>
      ) : (
        <span
          className="mljar-variable-inspector-variable-value"
          title={vrb.value}
        >
          {vrb.value}
        </span>
      )}
    </li>
  );
};
