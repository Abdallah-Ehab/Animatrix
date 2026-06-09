import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  style?: React.CSSProperties
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { background: '#4F8EF7', color: '#fff' },
  secondary: { background: '#2a3a5e', color: '#fff' },
  danger: { background: '#EF5350', color: '#fff' },
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '4px 8px', fontSize: 11 },
  md: { padding: '8px 16px', fontSize: 13 },
  lg: { padding: '12px 24px', fontSize: 15 },
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, style }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        border: 'none',
        borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 500,
        opacity: disabled ? 0.5 : 1,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {children}
    </button>
  )
}

interface SliderProps {
  label?: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
}

export function Slider({ label, min, max, step = 1, value, onChange }: SliderProps) {
  return (
    <div>
      {label && <label style={{ color: '#8899aa', fontSize: 11, display: 'block', marginBottom: 2 }}>{label}</label>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  )
}

interface ColorPickerProps {
  label?: string
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div>
      {label && <label style={{ color: '#8899aa', fontSize: 11, display: 'block', marginBottom: 2 }}>{label}</label>}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', height: 30, background: 'transparent', border: 'none', cursor: 'pointer' }}
      />
    </div>
  )
}
