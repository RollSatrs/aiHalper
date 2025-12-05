import { useState } from 'react'
import './AIAssistantButton.css'

const AIAssistantButton = ({ onOpen }) => {
  return (
    <button 
      className="ai-assistant-float" 
      onClick={onOpen} 
      aria-label="Открыть ИИ-ассистент"
      title="ИИ-ассистент поддержки"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
        <path d="M7 9H17V11H7V9ZM7 12H15V14H7V12ZM7 6H17V8H7V6Z" fill="currentColor" opacity="0.7"/>
        <circle cx="18" cy="6" r="2" fill="#10b981"/>
        <path d="M17.5 5.5L18.5 6.5L20 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    </button>
  )
}

export default AIAssistantButton

