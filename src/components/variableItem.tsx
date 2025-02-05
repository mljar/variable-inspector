import React from 'react';

interface VariableInfo {
  name: string;
  type: string;
  shape: string;
}

interface VariableItemProps {
  vrb: VariableInfo;
}

export const VariableItem: React.FC<VariableItemProps> = ({ vrb }) => {

  return (
    <li className='mljar-variable-item'>
      <span className='mljar-variable-name'>{vrb.name}</span>
      <span className='mljar-variable-type'>{vrb.type}</span>
      <span className='mljar-variable-shape'>{vrb.shape}</span>
      {
  /*    <button
        className='mljar-show-variable-button'
        onClick={handleButtonClick}
        aria-label={`Show details for ${vrb.name}`}
      >
        Show
      </button> */
      }
    </li>
  );
};
