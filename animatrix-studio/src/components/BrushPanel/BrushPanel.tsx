import { useUIStore } from '../../store/uiStore'
import { BRUSH_MODES } from '../../constants'

export function BrushPanel() {
  const brushMode = useUIStore(s => s.brushMode)
  const setBrushMode = useUIStore(s => s.setBrushMode)
  const brushSize = useUIStore(s => s.brushSize)
  const setBrushSize = useUIStore(s => s.setBrushSize)
  const brushColor = useUIStore(s => s.brushColor)
  const setBrushColor = useUIStore(s => s.setBrushColor)
  const brushOpacity = useUIStore(s => s.brushOpacity)
  const setBrushOpacity = useUIStore(s => s.setBrushOpacity)
  const brushSmoothing = useUIStore(s => s.brushSmoothing)
  const setBrushSmoothing = useUIStore(s => s.setBrushSmoothing)
  const activeTool = useUIStore(s => s.activeTool)
  const setActiveTool = useUIStore(s => s.setActiveTool)

  const modeIcons: Record<string, string> = {
    pen: '✒️ Pen',
    marker: '🖍️ Marker',
    chalk: '✏️ Chalk',
    ink: '🖊️ Ink',
    eraser: '🧹 Eraser',
  }

  return (
    <div style={{ width: 230, background: '#16213e', padding: 12, overflowY: 'auto', borderLeft: '1px solid #2a3a5e' }}>
      <h3 style={{ color: '#fff', fontSize: 14, margin: '0 0 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>✏️</span> Brush Tool
      </h3>

      <p style={{ color: '#8899aa', fontSize: 11, margin: '0 0 6px' }}>Mode</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 12 }}>
        {BRUSH_MODES.map(mode => (
          <button
            key={mode}
            onClick={() => { setBrushMode(mode); setActiveTool(mode === 'eraser' ? 'eraser' : 'brush') }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
              background: brushMode === mode ? '#4F8EF7' : '#1a1a2e',
              color: '#fff', border: `1px solid ${brushMode === mode ? '#4F8EF7' : '#2a3a5e'}`,
              borderRadius: 6, cursor: 'pointer', fontSize: 12, textAlign: 'left',
            }}
          >
            <span>{modeIcons[mode] ?? mode}</span>
            {activeTool === mode || (mode !== 'eraser' && activeTool === 'brush' && brushMode === mode) ? ' ✓' : ''}
          </button>
        ))}
      </div>

      <SliderField label={`Size: ${brushSize}px`} value={brushSize} min={1} max={60} step={1} onChange={setBrushSize} />
      <SliderField label={`Opacity: ${Math.round(brushOpacity * 100)}%`} value={brushOpacity} min={0} max={1} step={0.05} onChange={setBrushOpacity} />
      <SliderField label={`Smoothing: ${Math.round(brushSmoothing * 100)}%`} value={brushSmoothing} min={0} max={1} step={0.05} onChange={setBrushSmoothing} />

      <div style={{ marginTop: 12 }}>
        <p style={{ color: '#8899aa', fontSize: 11, margin: '0 0 4px' }}>Color</p>
        <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)}
          style={{ width: '100%', height: 32, background: 'transparent', border: 'none', cursor: 'pointer' }} />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: '#1a1a3e', borderRadius: 8 }}>
        <p style={{ color: '#667', fontSize: 11, margin: 0, lineHeight: 1.5 }}>
          Switch to Brush mode (✏️) and draw on the canvas.
        </p>
      </div>
    </div>
  )
}

function SliderField({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={{ color: '#8899aa', fontSize: 11, margin: '0 0 3px' }}>{label}</p>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#4F8EF7' }} />
    </div>
  )
}
