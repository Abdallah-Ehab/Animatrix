import { useState } from 'react'
import { useSceneStore } from '../../store/sceneStore'
import { useTimelineStore } from '../../store/timelineStore'
import { v4 as uuid } from 'uuid'

export function Inspector() {
  const selectedShapeIds = useSceneStore(s => s.selectedShapeIds)
  const shapes = useSceneStore(s => s.shapes)
  const updateShape = useSceneStore(s => s.updateShape)
  const removeShape = useSceneStore(s => s.removeShape)
  const animationTracks = useSceneStore(s => s.animationTracks)
  const addAnimationTrack = useSceneStore(s => s.addAnimationTrack)
  const addKeyframe = useSceneStore(s => s.addKeyframe)
  const currentFrame = useTimelineStore(s => s.currentFrame)
  const totalFrames = useTimelineStore(s => s.totalFrames)

  const [lineAnimStart, setLineAnimStart] = useState(0)
  const [lineAnimEnd, setLineAnimEnd] = useState(30)
  const [hlRow, setHlRow] = useState(0)
  const [hlCol, setHlCol] = useState(0)
  const [hlColor, setHlColor] = useState('#FF4444')
  const [hlStart, setHlStart] = useState(0)
  const [hlEnd, setHlEnd] = useState(30)

  const shape = selectedShapeIds.length === 1 ? shapes.get(selectedShapeIds[0]) : null

  if (!shape) {
    return (
      <div style={{ width: 300, background: '#16213e', borderLeft: '2px solid #2a3a5e', padding: 16, overflowY: 'auto' }}>
        <p style={{ color: '#667', fontSize: 13 }}>No shape selected</p>
        <p style={{ color: '#445', fontSize: 11, marginTop: 8 }}>Click a shape or use the Select tool (⬚) to select one</p>
      </div>
    )
  }

  const bb = shape.getBoundingBox()

  const update = (field: string, value: any) => updateShape(shape.id, { [field]: value } as any)

  const setKf = (prop: string) => {
    let track = animationTracks.find(t => t.targetId === shape.id && t.property === prop)
    if (!track) {
      track = { id: uuid(), targetId: shape.id, property: prop, keyframes: [], easing: 'linear' }
      addAnimationTrack(track)
    }
    const val = (shape as any)[prop] ?? 0
    addKeyframe(track.id, { frame: currentFrame, properties: { [prop]: val } })
  }

  const renderProp = (label: string, field: string, type: string = 'number', opts?: any) => (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={lblS}>{label}</label>
        <button onClick={() => setKf(field)} title={`Set keyframe for ${field}`}
          style={{ background: 'none', color: '#4F8EF7', border: 'none', cursor: 'pointer', fontSize: 10, padding: 0 }}>
          ◆
        </button>
      </div>
      {type === 'number' ? (
        <input type="number" value={(shape as any)[field] ?? 0}
          onChange={e => update(field, Number(e.target.value))} style={inpS} />
      ) : type === 'range' ? (
        <input type="range" min={opts?.min ?? 0} max={opts?.max ?? 1} step={opts?.step ?? 0.01}
          value={(shape as any)[field] ?? 0} onChange={e => update(field, Number(e.target.value))} style={{ width: '100%' }} />
      ) : type === 'color' ? (
        <input type="color" value={(shape as any)[field] ?? '#ffffff'}
          onChange={e => update(field, e.target.value)} style={{ width: '100%', height: 28, background: 'transparent', border: 'none', cursor: 'pointer' }} />
      ) : type === 'text' ? (
        <input type="text" value={(shape as any)[field] ?? ''}
          onChange={e => update(field, e.target.value)} style={inpS} />
      ) : null}
    </div>
  )

  const animateLine = () => {
    const targetId = shape.id
    let track = animationTracks.find(t => t.targetId === targetId && t.property === 'drawProgress')
    if (!track) {
      track = { id: uuid(), targetId, property: 'drawProgress', keyframes: [], easing: 'linear' }
      addAnimationTrack(track)
    }
    addKeyframe(track.id, { frame: lineAnimStart, properties: { drawProgress: 0 } })
    addKeyframe(track.id, { frame: lineAnimEnd, properties: { drawProgress: 1 } })
  }

  const animateGraph = () => {
    const targetId = shape.id
    let track = animationTracks.find(t => t.targetId === targetId && t.property === 'drawProgress')
    if (!track) {
      track = { id: uuid(), targetId, property: 'drawProgress', keyframes: [], easing: 'linear' }
      addAnimationTrack(track)
    }
    addKeyframe(track.id, { frame: lineAnimStart, properties: { drawProgress: 0 } })
    addKeyframe(track.id, { frame: lineAnimEnd, properties: { drawProgress: 1 } })
  }

  const addHighlight = () => {
    const schedule = (shape as any).highlightSchedule ?? []
    const entry = { row: hlRow, col: hlCol, color: hlColor, startFrame: Math.min(hlStart, hlEnd), endFrame: Math.max(hlStart, hlEnd) }
    updateShape(shape.id, { highlightSchedule: [...schedule, entry] } as any)
  }

  const removeHighlight = (index: number) => {
    const schedule = (shape as any).highlightSchedule ?? []
    const updated = schedule.filter((_: any, i: number) => i !== index)
    updateShape(shape.id, { highlightSchedule: updated } as any)
  }

  const shapeType = (shape as any).constructor?.name ?? 'Shape'

  const isLine = (shape as any).endX !== undefined && (shape as any).cp1x === undefined
  const isCurve = (shape as any).cp1x !== undefined
  const isGraph = shapeType === 'GraphShape'
  const isGrid = (shape as any).rows !== undefined
  const isLinkedList = shapeType === 'LinkedListShape'

  const totalFramesNum = totalFrames
  const frameInp = (val: number, set: (v: number) => void) => (
    <input type="number" min={0} max={totalFramesNum} value={val}
      onChange={e => set(Number(e.target.value))}
      style={{ width: 40, background: '#1a1a2e', color: '#fff', border: '1px solid #2a3a5e', borderRadius: 3, padding: '2px 4px', fontSize: 10 }} />
  )

  return (
    <div style={{
      width: 300, background: '#16213e', borderLeft: '2px solid #2a3a5e',
      padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <div style={{ borderBottom: '1px solid #2a3a5e', paddingBottom: 8, marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#fff', fontSize: 14, margin: 0 }}>{shape.name}</h3>
          <span style={{ color: '#4F8EF7', fontSize: 10, background: '#1a1a3e', padding: '2px 8px', borderRadius: 4 }}>{shapeType}</span>
        </div>
      </div>

      <SectionTitle text="TRANSFORM" />
      {renderProp('X', 'x')}
      {renderProp('Y', 'y')}
      {renderProp('Rotation °', 'rotation')}
      {renderProp('Scale X', 'scaleX', 'range', { min: 0.1, max: 5, step: 0.05 })}
      {renderProp('Scale Y', 'scaleY', 'range', { min: 0.1, max: 5, step: 0.05 })}

      {(shape as any).width !== undefined && (
        <>
          <SectionTitle text="DIMENSIONS" />
          {renderProp('Width', 'width')}
          {renderProp('Height', 'height')}
        </>
      )}

      {(shape as any).radius !== undefined && (
        <>
          <SectionTitle text="DIMENSIONS" />
          {renderProp('Radius', 'radius')}
        </>
      )}

      {(isLine || isCurve) && (
        <>
          <SectionTitle text={isCurve ? 'CURVE' : 'LINE'} />
          <div style={{ fontSize: 9, color: '#667', marginBottom: 4, padding: '2px 4px', background: '#1a1a3e', borderRadius: 3 }}>
            Values are local offsets from the shape position (X, Y)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
            <div style={{ padding: 4, background: '#1a1a3e', borderRadius: 4 }}>
              <div style={{ color: '#4CAF50', fontSize: 9, marginBottom: 2 }}>START</div>
              {renderProp('X', 'startX')}
              {renderProp('Y', 'startY')}
            </div>
            <div style={{ padding: 4, background: '#1a1a3e', borderRadius: 4 }}>
              <div style={{ color: '#EF5350', fontSize: 9, marginBottom: 2 }}>END</div>
              {renderProp('X', 'endX')}
              {renderProp('Y', 'endY')}
            </div>
          </div>
          {isCurve && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
              <div style={{ padding: 4, background: '#1a1a3e', borderRadius: 4 }}>
                <div style={{ color: '#F7A24F', fontSize: 9, marginBottom: 2 }}>CTRL PT 1</div>
                {renderProp('X', 'cp1x')}
                {renderProp('Y', 'cp1y')}
              </div>
              <div style={{ padding: 4, background: '#1a1a3e', borderRadius: 4 }}>
                <div style={{ color: '#AB47BC', fontSize: 9, marginBottom: 2 }}>CTRL PT 2</div>
                {renderProp('X', 'cp2x')}
                {renderProp('Y', 'cp2y')}
              </div>
            </div>
          )}
          <div style={{ marginTop: 4, padding: '6px', background: '#1a1a3e', borderRadius: 4 }}>
            <div style={{ color: '#F7A24F', fontSize: 10, fontWeight: 600, marginBottom: 4 }}>DRAW ANIMATION</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
              <span style={{ color: '#8899aa', fontSize: 10 }}>From:</span>
              {frameInp(lineAnimStart, setLineAnimStart)}
              <span style={{ color: '#8899aa', fontSize: 10 }}>To:</span>
              {frameInp(lineAnimEnd, setLineAnimEnd)}
            </div>
            <button onClick={animateLine}
              style={{ width: '100%', background: '#F7A24F', color: '#fff', border: 'none', borderRadius: 4, padding: '4px', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>
              Animate
            </button>
          </div>
        </>
      )}

      <SectionTitle text="STYLE" />
      {renderProp('Fill', 'fillColor', 'color')}
      {renderProp('Stroke', 'strokeColor', 'color')}
      {renderProp('Stroke Width', 'strokeWidth')}
      {renderProp('Opacity', 'opacity', 'range', { min: 0, max: 1, step: 0.05 })}

      {(shape as any).cornerRadius !== undefined && renderProp('Corner Radius', 'cornerRadius')}
      {(shape as any).fontSize !== undefined && (
        <>
          <SectionTitle text="TEXT" />
          {renderProp('Font Size', 'fontSize')}
          {renderProp('Text', 'text', 'text')}
          {renderProp('Font Family', 'fontFamily', 'text')}
          {renderProp('Font Weight', 'fontWeight', 'text')}
          {renderProp('Text Color', 'textColor', 'color')}
          {renderProp('Align', 'align', 'text')}
        </>
      )}

      {(shape as any).sides !== undefined && renderProp('Sides', 'sides')}
      {(shape as any).rows !== undefined && (
        <>
          <SectionTitle text="GRID" />
          {renderProp('Rows', 'rows')}
          {renderProp('Cols', 'cols')}
          {renderProp('Cell Width', 'cellWidth')}
          {renderProp('Cell Height', 'cellHeight')}
          <div style={{ marginTop: 6, padding: '6px', background: '#1a1a3e', borderRadius: 4 }}>
            <div style={{ color: '#F7A24F', fontSize: 10, fontWeight: 600, marginBottom: 4 }}>CELL HIGHLIGHT</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
              <span style={{ color: '#8899aa', fontSize: 10 }}>R:</span>
              <input type="number" min={0} max={(shape as any).rows - 1} value={hlRow} onChange={e => setHlRow(Number(e.target.value))}
                style={{ width: 36, background: '#1a1a2e', color: '#fff', border: '1px solid #2a3a5e', borderRadius: 3, padding: '2px 4px', fontSize: 10 }} />
              <span style={{ color: '#8899aa', fontSize: 10 }}>C:</span>
              <input type="number" min={0} max={(shape as any).cols - 1} value={hlCol} onChange={e => setHlCol(Number(e.target.value))}
                style={{ width: 36, background: '#1a1a2e', color: '#fff', border: '1px solid #2a3a5e', borderRadius: 3, padding: '2px 4px', fontSize: 10 }} />
              <input type="color" value={hlColor} onChange={e => setHlColor(e.target.value)}
                style={{ width: 28, height: 24, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }} />
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
              <span style={{ color: '#8899aa', fontSize: 10 }}>Start:</span>
              {frameInp(hlStart, setHlStart)}
              <span style={{ color: '#8899aa', fontSize: 10 }}>End:</span>
              {frameInp(hlEnd, setHlEnd)}
              <button onClick={addHighlight}
                style={{ background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 3, padding: '3px 8px', cursor: 'pointer', fontSize: 10 }}>
                Add
              </button>
            </div>
            {((shape as any).highlightSchedule ?? []).length > 0 && (
              <div style={{ marginTop: 4 }}>
                <div style={{ color: '#667', fontSize: 9, marginBottom: 2 }}>Active highlights:</div>
                {(shape as any).highlightSchedule.map((h: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ color: '#99aabb', fontSize: 9 }}>R{h.row}C{h.col} · f{h.startFrame}-{h.endFrame}</span>
                    <button onClick={() => removeHighlight(i)}
                      style={{ background: 'none', color: '#EF5350', border: 'none', cursor: 'pointer', fontSize: 9 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {isGraph && (
        <>
          <SectionTitle text="GRAPH" />
          <div style={{ marginTop: 6, padding: '6px', background: '#1a1a3e', borderRadius: 4 }}>
            <div style={{ color: '#F7A24F', fontSize: 10, fontWeight: 600, marginBottom: 4 }}>EDGE DRAW ANIMATION</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
              <span style={{ color: '#8899aa', fontSize: 10 }}>From:</span>
              {frameInp(lineAnimStart, setLineAnimStart)}
              <span style={{ color: '#8899aa', fontSize: 10 }}>To:</span>
              {frameInp(lineAnimEnd, setLineAnimEnd)}
            </div>
            <button onClick={animateGraph}
              style={{ width: '100%', background: '#F7A24F', color: '#fff', border: 'none', borderRadius: 4, padding: '4px', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>
              Animate
            </button>
          </div>
        </>
      )}

      {isLinkedList && (
        <>
          <SectionTitle text="LINKED LIST" />
          {renderProp('Node Width', 'nodeWidth')}
          {renderProp('Node Height', 'nodeHeight')}
          <div style={{ marginTop: 6, padding: '6px', background: '#1a1a3e', borderRadius: 4 }}>
            <div style={{ color: '#F7A24F', fontSize: 10, fontWeight: 600, marginBottom: 4 }}>NODE HIGHLIGHT</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
              <span style={{ color: '#8899aa', fontSize: 10 }}>Index:</span>
              <input type="number" min={0} value={hlRow} onChange={e => setHlRow(Number(e.target.value))}
                style={{ width: 36, background: '#1a1a2e', color: '#fff', border: '1px solid #2a3a5e', borderRadius: 3, padding: '2px 4px', fontSize: 10 }} />
              <input type="color" value={hlColor} onChange={e => setHlColor(e.target.value)}
                style={{ width: 28, height: 24, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }} />
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
              <span style={{ color: '#8899aa', fontSize: 10 }}>Start:</span>
              {frameInp(hlStart, setHlStart)}
              <span style={{ color: '#8899aa', fontSize: 10 }}>End:</span>
              {frameInp(hlEnd, setHlEnd)}
              <button onClick={() => {
                const schedule = (shape as any).nodeHighlightSchedule ?? []
                updateShape(shape.id, {
                  nodeHighlightSchedule: [...schedule, { index: hlRow, color: hlColor, startFrame: Math.min(hlStart, hlEnd), endFrame: Math.max(hlStart, hlEnd) }]
                } as any)
              }}
                style={{ background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 3, padding: '3px 8px', cursor: 'pointer', fontSize: 10 }}>
                Add
              </button>
            </div>
            {((shape as any).nodeHighlightSchedule ?? []).length > 0 && (
              <div style={{ marginTop: 4 }}>
                <div style={{ color: '#667', fontSize: 9, marginBottom: 2 }}>Active:</div>
                {(shape as any).nodeHighlightSchedule.map((h: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ color: '#99aabb', fontSize: 9 }}>N{h.index} · f{h.startFrame}-{h.endFrame}</span>
                    <button onClick={() => {
                      const s = (shape as any).nodeHighlightSchedule ?? []
                      updateShape(shape.id, { nodeHighlightSchedule: s.filter((_: any, j: number) => j !== i) } as any)
                    }}
                      style={{ background: 'none', color: '#EF5350', border: 'none', cursor: 'pointer', fontSize: 9 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <SectionTitle text="ANIMATION" />
      {animationTracks.filter(t => t.targetId === shape.id).length === 0 && (
        <p style={{ color: '#556', fontSize: 11, marginBottom: 6 }}>
          Move to a frame and click ◆ to set keyframes
        </p>
      )}
      {animationTracks.filter(t => t.targetId === shape.id).slice(0, 6).map(track => (
        <div key={track.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <span style={{ color: '#8899aa', fontSize: 11 }}>{track.property}</span>
          <span style={{ color: '#4F8EF7', fontSize: 10 }}>
            {track.keyframes.length} keyframes
          </span>
        </div>
      ))}

      <div style={{ borderTop: '1px solid #2a3a5e', paddingTop: 12, marginTop: 8 }}>
        <button onClick={() => removeShape(shape.id)}
          style={{ width: '100%', background: '#EF5350', color: '#fff', border: 'none', borderRadius: 6, padding: '8px', cursor: 'pointer', fontSize: 12 }}>
          Delete Shape
        </button>
      </div>
    </div>
  )
}

function SectionTitle({ text }: { text: string }) {
  return (
    <div style={{ color: '#4F8EF7', fontSize: 10, fontWeight: 600, letterSpacing: 1, marginTop: 8, marginBottom: 4, borderBottom: '1px solid #1a1a3e', paddingBottom: 2 }}>
      {text}
    </div>
  )
}

const lblS: React.CSSProperties = { color: '#8899aa', fontSize: 11, display: 'block', marginBottom: 1 }

const inpS: React.CSSProperties = {
  width: '100%', background: '#1a1a2e', color: '#fff',
  border: '1px solid #2a3a5e', borderRadius: 4, padding: '4px 8px',
  fontSize: 12, boxSizing: 'border-box', outline: 'none',
}
