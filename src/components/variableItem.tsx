import React from 'react'
import { detailIcon } from '../icons/detailIcon'

interface VariableInfo {
  name: string
  type: string
  shape: string
}

interface VariableItemProps {
  vrb: VariableInfo
}

const handleButtonClick = () => {
  console.log("Click")
}

export const VariableItem: React.FC<VariableItemProps> = ({ vrb }) => {
  return (
    <li className='mljar-variable-item'>
      <span className='mljar-variable-name'>{vrb.name}</span>
      <span className='mljar-variable-type'>{vrb.type}</span>
      <span className='mljar-variable-shape'>{vrb.shape}</span>
      <button
        className='mljar-show-variable-button'
        onClick={handleButtonClick}
        aria-label={`Show details for ${vrb.name}`}
      >
        <detailIcon.react className='mljar-variable-detail-button-icon' />
      </button>
    </li>
  )
}
