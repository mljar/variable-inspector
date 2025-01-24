import React from 'react'

interface VariableInfo {
  name: string
  type: string
  shape: string
}

interface VariableItemProps {
  vrb: VariableInfo
}

export const PackageItem: React.FC<VariableItemProps> = ({ vrb }) => {
  


  return (
    <li className='package-item'>
      <span className='package-name'> {vrb.name}</span>
      <span className='package-version'>{vrb.type}</span>
      <span className='package-version'>{vrb.shape}</span>
      <button
        className='mljar-show-variable-button'
      >
      </button>
    </li>
  )
}

