import React from 'react';

export const VariableList: React.FC = () => {


  return (
    <ul className='mljar-variable-list'>
        <li className='mljar-variable-header-list'>
          <span className='mljar-variable-header-name'>Name</span>
          <span className='mljar-variable-header-version'>Type</span>
          <span className='mljar-variable-header-version'>Shape</span>
          <span className='mljar-variable-header-blank'>&nbsp;</span>
        </li>
    </ul>
  );
};
