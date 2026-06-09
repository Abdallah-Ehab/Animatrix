import { useSceneStore } from '../../store/sceneStore'
import { useUIStore } from '../../store/uiStore'
import { ShapeFactory } from '../../core/shapes/ShapeFactory'
import { ChartFactory } from '../../core/charts/ChartFactory'
import { SHAPE_TYPES, CHART_TYPES } from '../../constants'

export function ShapeLibrary() {
  const addShape = useSceneStore(s => s.addShape)
  const isOpen = useUIStore(s => s.panelVisibility.shapeLibrary)
  const togglePanel = useUIStore(s => s.togglePanel)

  if (!isOpen) return null

  const handleAddShape = (type: string) => {
    const shape = ShapeFactory.createShape(type, {
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${Date.now()}`,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      fillColor: '#4F8EF7',
      strokeColor: '#ffffff',
    })
    addShape(shape)
  }

  const handleAddChart = (type: string) => {
    const chart = ChartFactory.createChart(type, {
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
      x: 100,
      y: 100,
    })
    addShape(chart as any)
  }

  return (
    <div style={{ width: 200, background: '#16213e', borderLeft: '1px solid #2a3a5e', padding: 12, overflowY: 'auto' }}>
      <h3 style={{ color: '#fff', fontSize: 13, margin: '0 0 12px' }}>Shapes</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
        {SHAPE_TYPES.slice(0, 9).map(type => (
          <button
            key={type}
            onClick={() => handleAddShape(type)}
            style={chipStyle}
          >
            {type}
          </button>
        ))}
      </div>

      <h3 style={{ color: '#fff', fontSize: 13, margin: '0 0 12px' }}>Charts</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {CHART_TYPES.map(type => (
          <button
            key={type}
            onClick={() => handleAddChart(type)}
            style={chipStyle}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  )
}

const chipStyle: React.CSSProperties = {
  background: '#2a3a5e',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '6px 10px',
  cursor: 'pointer',
  fontSize: 11,
}
