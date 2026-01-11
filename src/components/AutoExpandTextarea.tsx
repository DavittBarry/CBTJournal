import { useRef, useEffect, TextareaHTMLAttributes } from 'react'

interface AutoExpandTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number
  maxRows?: number
}

export function AutoExpandTextarea({ 
  minRows = 2, 
  maxRows = 10, 
  className = '',
  value,
  onChange,
  ...props 
}: AutoExpandTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24
    const paddingTop = parseInt(getComputedStyle(textarea).paddingTop) || 12
    const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom) || 12
    
    const minHeight = lineHeight * minRows + paddingTop + paddingBottom
    const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom
    
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
    textarea.style.height = `${newHeight}px`
  }, [value, minRows, maxRows])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className={`input-field resize-y ${className}`}
      style={{ minHeight: `${minRows * 24 + 24}px` }}
      {...props}
    />
  )
}
