import { useExportStore } from '../../store/exportStore'
import { PLATFORM_PRESETS, CRF_MAP } from '../../constants'
import { useUIStore } from '../../store/uiStore'

export function ExportModal() {
  const { config, setConfig, isExporting, progress, exportResult, setIsExporting, reset } = useExportStore()
  const isOpen = useUIStore(s => s.panelVisibility.exportModal)
  const togglePanel = useUIStore(s => s.togglePanel)

  if (!isOpen) return null

  const handlePreset = (key: string) => {
    const preset = PLATFORM_PRESETS[key as keyof typeof PLATFORM_PRESETS]
    if (preset.width && preset.height && preset.fps) {
      setConfig({ width: preset.width, height: preset.height, fps: preset.fps })
    }
  }

  const startExport = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
    }, 3000)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#16213e', borderRadius: 12, padding: 24,
        width: 600, maxHeight: '80vh', overflowY: 'auto',
        border: '1px solid #2a3a5e',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#fff', fontSize: 18, margin: 0 }}>Export Video</h2>
          <button onClick={() => togglePanel('exportModal')} style={{ background: 'none', color: '#8899aa', border: 'none', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>

        <p style={{ color: '#8899aa', fontSize: 11, margin: '0 0 8px' }}>Platform Presets</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {Object.entries(PLATFORM_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePreset(key)}
              style={{
                background: '#2a3a5e', color: '#fff', border: 'none',
                borderRadius: 6, padding: '8px 12px', cursor: 'pointer', fontSize: 11,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Width</label>
            <input type="number" value={config.width} onChange={(e) => setConfig({ width: Number(e.target.value) })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Height</label>
            <input type="number" value={config.height} onChange={(e) => setConfig({ height: Number(e.target.value) })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>FPS</label>
            <select value={config.fps} onChange={(e) => setConfig({ fps: Number(e.target.value) })} style={inputStyle}>
              <option value={24}>24</option>
              <option value={30}>30</option>
              <option value={60}>60</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Quality</label>
            <select value={config.quality} onChange={(e) => setConfig({ quality: e.target.value as any })} style={inputStyle}>
              <option value="high">High (CRF 18)</option>
              <option value="medium">Medium (CRF 23)</option>
              <option value="low">Low (CRF 28)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Format</label>
            <select value={config.format} onChange={(e) => setConfig({ format: e.target.value as any })} style={inputStyle}>
              <option value="mp4">MP4 (H.264)</option>
              <option value="webm">WebM (VP9 + Alpha)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Start Frame</label>
            <input type="number" value={config.startFrame} onChange={(e) => setConfig({ startFrame: Number(e.target.value) })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>End Frame</label>
            <input type="number" value={config.endFrame} onChange={(e) => setConfig({ endFrame: Number(e.target.value) })} style={inputStyle} />
          </div>
        </div>

        {isExporting && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#8899aa', fontSize: 12, marginBottom: 4 }}>
              Rendering: {progress.rendered} / {progress.total} frames
            </div>
            <div style={{ background: '#1a1a2e', height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${(progress.rendered / Math.max(progress.total, 1)) * 100}%`,
                height: '100%',
                background: '#4F8EF7',
                borderRadius: 4,
                transition: 'width 0.2s',
              }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={startExport}
            disabled={isExporting}
            style={{
              flex: 1, background: '#4F8EF7', color: '#fff', border: 'none',
              borderRadius: 8, padding: '12px', cursor: isExporting ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 600,
            }}
          >
            {isExporting ? 'Exporting...' : 'Export Video'}
          </button>
          {exportResult && (
            <button
              onClick={() => {
                const url = URL.createObjectURL(exportResult)
                const a = document.createElement('a')
                a.href = url
                a.download = `animatrix-export.${config.format}`
                a.click()
              }}
              style={{
                background: '#4CAF50', color: '#fff', border: 'none',
                borderRadius: 8, padding: '12px 20px', cursor: 'pointer',
                fontSize: 14, fontWeight: 600,
              }}
            >
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { color: '#8899aa', fontSize: 11, display: 'block', marginBottom: 4 }

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#1a1a2e', color: '#fff',
  border: '1px solid #2a3a5e', borderRadius: 4, padding: '6px 8px',
  fontSize: 12, boxSizing: 'border-box',
}
