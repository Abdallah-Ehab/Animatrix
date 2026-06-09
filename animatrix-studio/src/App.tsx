import { Toolbar } from './components/Toolbar'
import { Viewport } from './components/Viewport'
import { Timeline } from './components/Timeline'
import { Inspector } from './components/Inspector'
import { BrushPanel } from './components/BrushPanel'
import { ExportModal } from './components/ExportModal'
import { ShapeLibrary } from './components/ShapeLibrary'
import { useUIStore } from './store/uiStore'

function App() {
  const togglePanel = useUIStore(s => s.togglePanel)
  const panelVisibility = useUIStore(s => s.panelVisibility)
  const showGrid = useUIStore(s => s.showGrid)
  const toggleGrid = useUIStore(s => s.toggleGrid)
  const snapToGrid = useUIStore(s => s.snapToGrid)
  const toggleSnap = useUIStore(s => s.toggleSnap)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0d0d1a', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>
      <header style={{
        height: 42, background: '#16213e', borderBottom: '2px solid #2a3a5e',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12,
        zIndex: 100, position: 'relative',
      }}>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#4F8EF7', letterSpacing: -0.5 }}>
          Animatrix Studio
        </span>

        <div style={{ width: 1, height: 24, background: '#2a3a5e' }} />

        <button onClick={() => togglePanel('shapeLibrary')}
          style={navBtn(panelVisibility.shapeLibrary)}>
          {panelVisibility.shapeLibrary ? 'Shapes ▾' : 'Shapes ▸'}
        </button>
        <button onClick={() => togglePanel('brushPanel')}
          style={navBtn(panelVisibility.brushPanel)}>
          {panelVisibility.brushPanel ? 'Brush ▾' : 'Brush ▸'}
        </button>

        <div style={{ flex: 1 }} />

        <button onClick={toggleGrid}
          style={navBtn(showGrid)}>
          Grid {showGrid ? '✓' : '☐'}
        </button>
        <button onClick={toggleSnap}
          style={navBtn(snapToGrid)}>
          Snap {snapToGrid ? '✓' : '☐'}
        </button>

        <button onClick={() => togglePanel('exportModal')}
          style={{ ...navBtn(false), background: '#4F8EF7', color: '#fff', fontWeight: 600 }}>
          Export
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Toolbar />

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Viewport />
            </div>

            {(panelVisibility.shapeLibrary || panelVisibility.brushPanel) && (
              <div style={{ display: 'flex', borderLeft: '2px solid #2a3a5e' }}>
                {panelVisibility.shapeLibrary && <ShapeLibrary />}
                {panelVisibility.brushPanel && <BrushPanel />}
              </div>
            )}
          </div>

          <Timeline />
        </div>

        <Inspector />
      </div>

      <ExportModal />
    </div>
  )
}

const navBtn = (active: boolean): React.CSSProperties => ({
  background: active ? '#2a3a5e' : 'transparent',
  color: active ? '#fff' : '#8899aa',
  border: '1px solid transparent',
  borderRadius: 6,
  padding: '6px 14px',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 500,
  transition: 'all 0.1s',
})

export default App
