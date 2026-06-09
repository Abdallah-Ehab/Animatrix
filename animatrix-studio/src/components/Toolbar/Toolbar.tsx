import { useUIStore } from '../../store/uiStore'
import { useSceneStore } from '../../store/sceneStore'
import { ShapeFactory } from '../../core/shapes/ShapeFactory'
import { useTimelineStore } from '../../store/timelineStore'

const TOP_TOOLS = [
  { id: 'select', label: '⬚', title: 'Select / Move' },
  { id: 'pan', label: '✋', title: 'Pan' },
] as const

const SHAPE_TOOLS = [
  { id: 'rect', label: '▭', title: 'Rectangle' },
  { id: 'circle', label: '○', title: 'Circle' },
  { id: 'ellipse', label: '⬮', title: 'Ellipse' },
  { id: 'line', label: '╱', title: 'Line' },
  { id: 'arrow', label: '→', title: 'Arrow' },
  { id: 'curve', label: '~', title: 'Curve' },
  { id: 'text', label: 'T', title: 'Text' },
  { id: 'polygon', label: '⬡', title: 'Polygon' },
] as const

const BRUSH_TOOLS = [
  { id: 'brush', label: '✏', title: 'Brush' },
  { id: 'eraser', label: '◌', title: 'Eraser' },
] as const

const CS_SHAPES = [
  { id: 'grid', label: '⊞', title: 'Grid' },
  { id: 'arrayBar', label: '📊', title: 'Array Bars' },
  { id: 'coordinatePlane', label: '⌗', title: 'Coordinate Plane' },
  { id: 'linkedList', label: '🔗', title: 'Linked List' },
  { id: 'binaryTree', label: '🌳', title: 'Binary Tree' },
  { id: 'graph', label: '◉', title: 'Graph' },
] as const

export function Toolbar() {
  const activeTool = useUIStore(s => s.activeTool)
  const setActiveTool = useUIStore(s => s.setActiveTool)
  const addShape = useSceneStore(s => s.addShape)

  const handleClick = (toolId: string) => {
    setActiveTool(toolId as any)

    if (toolId === 'rect') {
      const s = ShapeFactory.createShape('rect', { name: 'Rectangle', x: 150, y: 150, fillColor: '#4F8EF7', strokeColor: '#ffffff', strokeWidth: 2 }) as any
      s.width = 200; s.height = 150; addShape(s)
    } else if (toolId === 'circle') {
      const s = ShapeFactory.createShape('circle', { name: 'Circle', x: 150, y: 150, fillColor: '#4F8EF7', strokeColor: '#ffffff', strokeWidth: 2 }) as any
      s.radius = 60; addShape(s)
    } else if (toolId === 'ellipse') {
      const s = ShapeFactory.createShape('ellipse', { name: 'Ellipse', x: 150, y: 150, fillColor: '#4F8EF7', strokeColor: '#ffffff', strokeWidth: 2 }) as any
      s.radiusX = 80; s.radiusY = 50; addShape(s)
    } else if (toolId === 'line') {
      const s = ShapeFactory.createShape('line', { name: 'Line', x: 100, y: 100, strokeColor: '#ffffff', strokeWidth: 3 }) as any
      s.endX = 200; s.endY = 100; addShape(s)
    } else if (toolId === 'arrow') {
      const s = ShapeFactory.createShape('line', { name: 'Arrow', x: 100, y: 150, strokeColor: '#ffffff', strokeWidth: 3 }) as any
      s.endX = 250; s.endY = 0; s.capStyle = 'arrow'; addShape(s)
    } else if (toolId === 'curve') {
      const s = ShapeFactory.createShape('curve', { name: 'Curve', x: 150, y: 150, strokeColor: '#ffffff', strokeWidth: 3 }) as any
      s.endX = 150; s.endY = 100; s.cp1x = -50; s.cp1y = -50; s.cp2x = 200; s.cp2y = 150; addShape(s)
    } else if (toolId === 'text') {
      const s = ShapeFactory.createShape('text', { name: 'Text', x: 150, y: 150, strokeColor: '#ffffff' }) as any
      s.text = 'Hello'; s.fontSize = 32; s.fontFamily = 'Arial'; s.textColor = '#ffffff'
      addShape(s)
    } else if (toolId === 'polygon') {
      const s = ShapeFactory.createShape('polygon', { name: 'Polygon', x: 150, y: 150, fillColor: '#4F8EF7', strokeColor: '#ffffff', strokeWidth: 2 }) as any
      s.sides = 6; s.radius = 60
      addShape(s)
    } else if (toolId === 'grid') {
      const s = ShapeFactory.createShape('grid', { name: 'Grid', x: 50, y: 50 }) as any
      s.rows = 4; s.cols = 4; s.cellWidth = 60; s.cellHeight = 40
      addShape(s)
    } else if (toolId === 'arrayBar') {
      const s = ShapeFactory.createShape('arrayBar', { name: 'Array Bars', x: 50, y: 50 }) as any
      s.values = [10, 30, 50, 20, 40, 35, 25]; s.showValues = true; s.showIndices = true; s.fillColor = '#4F8EF7'
      addShape(s)
    } else if (toolId === 'coordinatePlane') {
      const s = ShapeFactory.createShape('coordinatePlane', { name: 'Coord Plane', x: 50, y: 50, strokeColor: '#ffffff' })
      addShape(s)
    } else if (toolId === 'linkedList') {
      const s = ShapeFactory.createShape('linkedList', { name: 'Linked List', x: 50, y: 80, strokeColor: '#4F8EF7' }) as any
      s.nodes = [{ label: '3' }, { label: '7' }, { label: '1' }, { label: '9' }]
      addShape(s)
    } else if (toolId === 'binaryTree') {
      const s = ShapeFactory.createShape('binaryTree', { name: 'Tree', x: 50, y: 50, strokeColor: '#4F8EF7' }) as any
      s.root = { id: '1', value: 5, left: { id: '2', value: 3 }, right: { id: '3', value: 8 } }
      addShape(s)
    } else if (toolId === 'graph') {
      const s = ShapeFactory.createShape('graph', { name: 'Graph', x: 50, y: 50, strokeColor: '#4F8EF7' }) as any
      s.nodes = [{ id: 'a', label: 'A', x: 200, y: 100 }, { id: 'b', label: 'B', x: 100, y: 200 }, { id: 'c', label: 'C', x: 300, y: 200 }]
      s.edges = [{ from: 'a', to: 'b' }, { from: 'a', to: 'c' }, { from: 'b', to: 'c' }]
      addShape(s)
    }
  }

  const btnStyle = (id: string): React.CSSProperties => ({
    width: 36, height: 36, margin: '2px 4px',
    background: activeTool === id ? '#4F8EF7' : 'transparent',
    color: activeTool === id ? '#fff' : '#8899aa',
    border: activeTool === id ? '1px solid #6FAEFF' : '1px solid transparent',
    borderRadius: 6, cursor: 'pointer', fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.1s',
  })

  return (
    <div style={{ width: 48, background: '#16213e', borderRight: '2px solid #2a3a5e', display: 'flex', flexDirection: 'column', padding: '4px 0', gap: 1, overflowY: 'auto' }}>
      <Section label="TOOLS" />
      {TOP_TOOLS.map(t => (
        <button key={t.id} onClick={() => handleClick(t.id)} title={t.title} style={btnStyle(t.id)}>{t.label}</button>
      ))}

      <Section label="SHAPES" />
      {SHAPE_TOOLS.map(t => (
        <button key={t.id} onClick={() => handleClick(t.id)} title={t.title} style={btnStyle(t.id)}>{t.label}</button>
      ))}

      <Section label="BRUSH" />
      {BRUSH_TOOLS.map(t => (
        <button key={t.id} onClick={() => handleClick(t.id)} title={t.title} style={btnStyle(t.id)}>{t.label}</button>
      ))}

      <Section label="CS" />
      {CS_SHAPES.map(t => (
        <button key={t.id} onClick={() => handleClick(t.id)} title={t.title} style={btnStyle(t.id)}>{t.label}</button>
      ))}
    </div>
  )
}

function Section({ label }: { label: string }) {
  return (
    <div style={{ color: '#4F8EF7', fontSize: 8, fontWeight: 600, textAlign: 'center', letterSpacing: 1, marginTop: 4, marginBottom: 1 }}>
      {label}
    </div>
  )
}
