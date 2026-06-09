import { useRef, useEffect, useCallback } from 'react'
import { useTimelineStore } from '../../store/timelineStore'
import { useSceneStore, type AnimationTrack } from '../../store/sceneStore'
import { useUIStore } from '../../store/uiStore'
import { v4 as uuid } from 'uuid'

const FRAME_WIDTH = 8
const TRACK_HEIGHT = 28
const HEADER_HEIGHT = 28

export function Timeline() {
  const trackListRef = useRef<HTMLDivElement>(null)
  const {
    currentFrame, totalFrames, fps, isPlaying,
    setCurrentFrame, setTotalFrames, setFps, setIsPlaying
  } = useTimelineStore()

  const animationTracks = useSceneStore(s => s.animationTracks)
  const selectedShapeIds = useSceneStore(s => s.selectedShapeIds)
  const addAnimationTrack = useSceneStore(s => s.addAnimationTrack)
  const addKeyframe = useSceneStore(s => s.addKeyframe)
  const removeAnimationTrack = useSceneStore(s => s.removeAnimationTrack)
  const removeKeyframe = useSceneStore(s => s.removeKeyframe)
  const showPathOfMotion = useUIStore(s => s.showPathOfMotion)
  const showOnionSkinning = useUIStore(s => s.showOnionSkinning)
  const togglePathOfMotion = useUIStore(s => s.togglePathOfMotion)
  const toggleOnionSkinning = useUIStore(s => s.toggleOnionSkinning)

  const rafRef = useRef<number | null>(null)
  const playStartRef = useRef<number>(0)
  const startFrameRef = useRef<number>(0)

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }
    playStartRef.current = performance.now()
    startFrameRef.current = currentFrame

    const tick = (now: number) => {
      const elapsed = (now - playStartRef.current) / 1000
      const framesElapsed = Math.floor(elapsed * fps)
      const nextFrame = startFrameRef.current + framesElapsed
      if (nextFrame > totalFrames) {
        setCurrentFrame(0)
        playStartRef.current = now
        startFrameRef.current = 0
      } else {
        setCurrentFrame(nextFrame)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isPlaying, fps, totalFrames, currentFrame, setCurrentFrame])

  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const frame = Math.round((x / rect.width) * totalFrames)
    setCurrentFrame(Math.max(0, Math.min(frame, totalFrames)))
  }, [totalFrames, setCurrentFrame])

  const addTrack = () => {
    if (selectedShapeIds.length === 0) return
    const targetId = selectedShapeIds[0]
    const track: AnimationTrack = {
      id: uuid(),
      targetId,
      property: 'x',
      keyframes: [],
      easing: 'linear',
    }
    addAnimationTrack(track)
  }

  const setKeyframe = () => {
    if (selectedShapeIds.length === 0 || animationTracks.length === 0) return
    const targetId = selectedShapeIds[0]
    const shape = useSceneStore.getState().shapes.get(targetId)
    if (!shape) return
    for (const track of animationTracks) {
      if (track.targetId !== targetId) continue
      const val = (shape as any)[track.property] ?? 0
      addKeyframe(track.id, {
        frame: currentFrame,
        properties: { [track.property]: val },
      })
    }
  }

  const setStartKeyframe = () => {
    if (selectedShapeIds.length === 0) return
    const targetId = selectedShapeIds[0]
    const shape = useSceneStore.getState().shapes.get(targetId)
    if (!shape) return

    const props = ['x', 'y', 'opacity', 'rotation']
    for (const prop of props) {
      let track = animationTracks.find(t => t.targetId === targetId && t.property === prop)
      if (!track) {
        track = { id: uuid(), targetId, property: prop, keyframes: [], easing: 'linear' }
        addAnimationTrack(track)
      }
      const val = (shape as any)[prop] ?? 0
      addKeyframe(track.id, { frame: currentFrame, properties: { [prop]: val } })
    }
  }

  const setEndKeyframe = () => {
    if (selectedShapeIds.length === 0) return
    const targetId = selectedShapeIds[0]
    const shape = useSceneStore.getState().shapes.get(targetId)
    if (!shape) return

    const props = ['x', 'y', 'opacity', 'rotation']
    for (const prop of props) {
      let track = animationTracks.find(t => t.targetId === targetId && t.property === prop)
      if (!track) {
        track = { id: uuid(), targetId, property: prop, keyframes: [], easing: 'linear' }
        addAnimationTrack(track)
      }
      const val = (shape as any)[prop] ?? 0
      addKeyframe(track.id, { frame: currentFrame, properties: { [prop]: val } })
    }
  }

  const timelineWidth = Math.max(totalFrames * FRAME_WIDTH, 400)

  const formatTime = (frame: number) => {
    const secs = Math.floor(frame / fps)
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    const f = frame % fps
    return `${mins}:${String(s).padStart(2, '0')}.${String(f).padStart(2, '0')}`
  }

  return (
    <div style={{ height: 220, background: '#16213e', borderTop: '2px solid #2a3a5e', display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderBottom: '1px solid #2a3a5e', background: '#1a1a3e' }}>
        <button onClick={() => { setCurrentFrame(0); setIsPlaying(false) }} style={btnS}>⏮</button>
        <button onClick={() => setIsPlaying(!isPlaying)} style={{ ...btnS, background: isPlaying ? '#F7A24F' : '#4F8EF7' }}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={() => setIsPlaying(false)} style={btnS}>⏹</button>

        <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginLeft: 8, minWidth: 100 }}>
          {formatTime(currentFrame)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{ color: '#8899aa', fontSize: 11 }}>Frame</span>
          <input type="number" min={0} max={totalFrames}
            value={currentFrame}
            onChange={e => setCurrentFrame(Math.max(0, Math.min(totalFrames, Number(e.target.value))))}
            onFocus={e => e.target.select()}
            style={{
              width: 50, background: '#1a1a2e', color: '#fff',
              border: '1px solid #4F8EF7', borderRadius: 4, padding: '2px 6px',
              fontSize: 12, textAlign: 'center', outline: 'none',
            }}
          />
          <span style={{ color: '#8899aa', fontSize: 11 }}>/ {totalFrames}</span>
        </div>

        <div style={{ marginLeft: 16, display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ color: '#8899aa', fontSize: 11 }}>FPS:</span>
          {[24, 30, 60].map(f => (
            <button key={f} onClick={() => setFps(f)}
              style={{ ...chipS, background: fps === f ? '#4F8EF7' : '#2a3a5e' }}>{f}</button>
          ))}
        </div>

        <div style={{ marginLeft: 8, display: 'flex', gap: 4, alignItems: 'center' }}>
          <button onClick={toggleOnionSkinning}
            style={{ ...chipS, background: showOnionSkinning ? '#4F8EF7' : '#2a3a5e' }}
            title="Toggle onion skinning">🧅</button>
          <button onClick={togglePathOfMotion}
            style={{ ...chipS, background: showPathOfMotion ? '#4F8EF7' : '#2a3a5e' }}
            title="Toggle path of motion">⤵</button>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
          <button onClick={setStartKeyframe} style={{ ...btnS, background: '#4CAF50', fontSize: 10 }} title="Set start keyframe (current position)">
            ◀K
          </button>
          <button onClick={setEndKeyframe} style={{ ...btnS, background: '#F7A24F', fontSize: 10 }} title="Set end keyframe (current position)">
            K▶
          </button>
          <button onClick={setKeyframe} style={{ ...btnS, background: '#4F8EF7', fontSize: 10 }} title="Set keyframe for current property">
            ◆
          </button>
          <button onClick={addTrack} style={{ ...btnS, background: '#2a3a5e', fontSize: 10 }} title="Add animation track">
            +Track
          </button>
          <input type="number" value={totalFrames} onChange={(e) => setTotalFrames(Math.max(1, Number(e.target.value)))}
            style={{ width: 50, background: '#1a1a2e', color: '#fff', border: '1px solid #2a3a5e', borderRadius: 4, padding: '2px 6px', fontSize: 11 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div ref={trackListRef} style={{ width: 160, minWidth: 160, borderRight: '1px solid #2a3a5e', overflowY: 'auto', background: '#13132e' }}>
          <div style={{ height: HEADER_HEIGHT, display: 'flex', alignItems: 'center', padding: '0 8px', borderBottom: '1px solid #2a3a5e' }}>
            <span style={{ color: '#8899aa', fontSize: 10, fontWeight: 600 }}>ANIMATION TRACKS</span>
          </div>
          {animationTracks.length === 0 && (
            <div style={{ padding: 12, color: '#555', fontSize: 11, textAlign: 'center' }}>
              Select a shape, then click ◀K to set start keyframe
            </div>
          )}
          {animationTracks.map(track => (
            <div key={track.id} style={{
              height: TRACK_HEIGHT, display: 'flex', alignItems: 'center', padding: '0 8px',
              borderBottom: '1px solid #1a1a3e', justifyContent: 'space-between',
            }}>
              <span style={{ color: '#ccc', fontSize: 11 }}>
                {track.property}
                <span style={{ color: '#667', fontSize: 9, marginLeft: 4 }}>
                  ({track.targetId.slice(0, 6)})
                </span>
              </span>
              <button onClick={() => removeAnimationTrack(track.id)}
                style={{ background: 'none', color: '#EF5350', border: 'none', cursor: 'pointer', fontSize: 10 }}>
                ✕
              </button>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', position: 'relative' }}
          onScroll={(e) => {
            if (trackListRef.current) {
              trackListRef.current.scrollTop = (e.target as HTMLElement).scrollTop
            }
          }}>
          <div style={{ width: timelineWidth, minWidth: '100%', position: 'relative' }}>
            <div style={{ height: HEADER_HEIGHT, borderBottom: '1px solid #2a3a5e', position: 'relative', background: '#1a1a3e' }}>
              {Array.from({ length: Math.ceil(totalFrames / 10) + 1 }, (_, i) => {
                const f = i * 10
                if (f > totalFrames) return null
                const left = (f / totalFrames) * timelineWidth
                return (
                  <div key={f} style={{ position: 'absolute', left, top: 0, bottom: 0, borderLeft: '1px solid #333' }}>
                    <span style={{ position: 'absolute', left: 3, top: 2, color: '#667', fontSize: 9 }}>{f}</span>
                  </div>
                )
              })}
            </div>

            <div style={{ position: 'relative' }} onClick={handleTimelineClick}>
              {animationTracks.map((track) => (
                <div key={track.id} style={{ height: TRACK_HEIGHT, borderBottom: '1px solid #1a1a3e', position: 'relative' }}>
                  {track.keyframes.map(kf => (
                    <div
                      key={kf.frame}
                      onClick={(e) => { e.stopPropagation(); setCurrentFrame(kf.frame) }}
                      title={`Frame ${kf.frame}: ${JSON.stringify(kf.properties)}`}
                      style={{
                        position: 'absolute',
                        left: (kf.frame / totalFrames) * timelineWidth - 4,
                        top: 4, width: 10, height: 20,
                        background: currentFrame === kf.frame ? '#F7A24F' : '#4F8EF7',
                        borderRadius: 2, cursor: 'pointer', zIndex: 2,
                        border: currentFrame === kf.frame ? '1px solid #fff' : '1px solid transparent',
                      }}
                    />
                  ))}
                </div>
              ))}

              <div
                style={{
                  position: 'absolute',
                  left: `${(currentFrame / Math.max(totalFrames, 1)) * 100}%`,
                  top: 0, bottom: 0, width: 2,
                  background: '#FF4444', zIndex: 10, pointerEvents: 'none',
                  boxShadow: '0 0 6px rgba(255,68,68,0.5)',
                  transition: 'left 0.05s linear',
                }}
              >
                <div style={{
                  width: 10, height: 10, background: '#FF4444',
                  borderRadius: '0 0 4px 4px', marginLeft: -4,
                  boxShadow: '0 0 6px rgba(255,68,68,0.5)',
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const btnS: React.CSSProperties = {
  background: '#2a3a5e', color: '#fff', border: 'none', borderRadius: 4,
  padding: '4px 10px', cursor: 'pointer', fontSize: 13, lineHeight: 1.2,
}

const chipS: React.CSSProperties = {
  color: '#fff', border: 'none', borderRadius: 3, padding: '2px 8px',
  cursor: 'pointer', fontSize: 11,
}
