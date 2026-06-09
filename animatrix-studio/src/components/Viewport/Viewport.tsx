import { useRef, useEffect, useCallback, useState } from 'react'
import { useSceneStore, type AnimationTrack, type Keyframe } from '../../store/sceneStore'
import { useUIStore } from '../../store/uiStore'
import { useTimelineStore } from '../../store/timelineStore'
import { BrushTool } from '../../core/brush/BrushTool'
import { ShapeFactory } from '../../core/shapes/ShapeFactory'
import { FXPipeline } from '../../core/fx/FXPipeline'
import { BaseShape } from '../../core/shapes/BaseShape'
import { COLOR_DEFAULTS } from '../../constants'
import { v4 as uuid } from 'uuid'

const HANDLE_SIZE = 8
const HANDLE_COLOR = '#4F8EF7'
const SELECTION_COLOR = '#4F8EF7'

interface DragState {
  type: 'move' | 'resize' | 'rotate' | 'draw' | 'controlPoint' | 'none'
  startX: number
  startY: number
  originalShapes: Map<string, { x: number; y: number; width?: number; height?: number; rotation?: number; x2?: number; y2?: number }>
  handle?: string
  drawStart?: { x: number; y: number }
  currentShape?: BaseShape
  interactingIds: Set<string>
  controlPoint?: { shapeId: string; field: string }
}

export function Viewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState>({ type: 'none', startX: 0, startY: 0, originalShapes: new Map(), interactingIds: new Set() })
  const brushRef = useRef<BrushTool | null>(null)
  const canvasSize = useRef({ width: 1200, height: 800 })

  const shapes = useSceneStore(s => s.shapes)
  const layers = useSceneStore(s => s.layers)
  const background = useSceneStore(s => s.background)
  const selectedShapeIds = useSceneStore(s => s.selectedShapeIds)
  const selectShape = useSceneStore(s => s.selectShape)
  const deselectAll = useSceneStore(s => s.deselectAll)
  const addShape = useSceneStore(s => s.addShape)
  const updateShape = useSceneStore(s => s.updateShape)
  const animationTracks = useSceneStore(s => s.animationTracks)
  const getAnimatedValue = useSceneStore(s => s.getAnimatedValue)
  const addKeyframe = useSceneStore(s => s.addKeyframe)

  const activeTool = useUIStore(s => s.activeTool)
  const brushMode = useUIStore(s => s.brushMode)
  const brushSize = useUIStore(s => s.brushSize)
  const brushColor = useUIStore(s => s.brushColor)
  const brushOpacity = useUIStore(s => s.brushOpacity)
  const brushSmoothing = useUIStore(s => s.brushSmoothing)
  const showGrid = useUIStore(s => s.showGrid)
  const snapToGrid = useUIStore(s => s.snapToGrid)

  const currentFrame = useTimelineStore(s => s.currentFrame)
  const totalFrames = useTimelineStore(s => s.totalFrames)
  const showPathOfMotion = useUIStore(s => s.showPathOfMotion)
  const showOnionSkinning = useUIStore(s => s.showOnionSkinning)

  useEffect(() => {
    if (!brushRef.current) {
      brushRef.current = new BrushTool()
    }
    brushRef.current.configure({
      mode: brushMode,
      brushSize,
      color: brushColor,
      opacity: brushOpacity,
      smoothing: brushSmoothing,
    })
  }, [brushMode, brushSize, brushColor, brushOpacity, brushSmoothing])

  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  const resizeCanvas = useCallback(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const rect = container.getBoundingClientRect()
    const w = Math.floor(rect.width)
    const h = Math.floor(rect.height)
    canvas.width = w
    canvas.height = h
    canvasSize.current = { width: w, height: h }
    requestAnimationFrame(() => render())
  }, [])

  const sortedShapes: BaseShape[] = []
  for (const [, layer] of layers) {
    if (!layer.data.visible) continue
    for (const sid of layer.shapes) {
      const s = shapes.get(sid)
      if (s) sortedShapes.push(s)
    }
  }

  const drawOnionSkin = (ctx: CanvasRenderingContext2D) => {
    if (currentFrame <= 0) return
    ctx.save()
    ctx.globalAlpha = 0.12
    for (const shape of sortedShapes) {
      ;(shape as any)._currentFrame = currentFrame - 1
      const saved: Record<string, any> = {}
      const props = ['x', 'y', 'rotation', 'scaleX', 'scaleY', 'opacity', 'width', 'height', 'radius']
      for (const prop of props) {
        const val = getAnimatedValue(prop, shape.id, currentFrame - 1)
        if (val !== undefined) {
          saved[prop] = (shape as any)[prop]
          ;(shape as any)[prop] = val
        }
      }
      FXPipeline.draw(shape, ctx)
      for (const [prop, val] of Object.entries(saved)) {
        ;(shape as any)[prop] = val
      }
    }
    ctx.restore()
  }

  const drawPathOfMotion = (ctx: CanvasRenderingContext2D) => {
    ctx.save()
    for (const sid of selectedShapeIds) {
      const shape = shapes.get(sid)
      if (!shape) continue
      const hasTrack = animationTracks.some(t => t.targetId === sid && (t.property === 'x' || t.property === 'y'))
      if (!hasTrack) continue
      const points: { x: number; y: number }[] = []
      const step = Math.max(1, Math.floor(totalFrames / 50))
      for (let f = 0; f <= totalFrames; f += step) {
        const ax = getAnimatedValue('x', sid, f) ?? shape.x
        const ay = getAnimatedValue('y', sid, f) ?? shape.y
        points.push({ x: ax, y: ay })
      }
      if (points.length < 2) continue
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
      ctx.strokeStyle = 'rgba(79, 142, 247, 0.35)'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.stroke()
      ctx.setLineDash([])
      for (const p of points) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(79, 142, 247, 0.5)'
        ctx.fill()
      }
    }
    ctx.restore()
  }

  const getControlPoints = (shape: BaseShape): { x: number; y: number; label: string; field: string }[] => {
    const pts: { x: number; y: number; label: string; field: string }[] = []
    if ('getWorldStart' in shape && typeof (shape as any).getWorldStart === 'function') {
      const line = shape as any
      const ws = line.getWorldStart()
      const we = line.getWorldEnd()
      pts.push({ x: ws.x, y: ws.y, label: 'start', field: 'start' })
      pts.push({ x: we.x, y: we.y, label: 'end', field: 'end' })
      if ('getWorldCP1' in line && typeof line.getWorldCP1 === 'function') {
        const cp1 = line.getWorldCP1()
        const cp2 = line.getWorldCP2()
        pts.push({ x: cp1.x, y: cp1.y, label: 'cp1', field: 'cp1' })
        pts.push({ x: cp2.x, y: cp2.y, label: 'cp2', field: 'cp2' })
      }
    }
    return pts
  }

  const drawControlPoints = (ctx: CanvasRenderingContext2D, shape: BaseShape) => {
    const pts = getControlPoints(shape)
    const colors: Record<string, string> = { start: '#4CAF50', end: '#EF5350', cp1: '#F7A24F', cp2: '#AB47BC' }
    const labels: Record<string, string> = { start: 'S', end: 'E', cp1: 'C1', cp2: 'C2' }
    for (const pt of pts) {
      const c = colors[pt.label] ?? '#4F8EF7'
      ctx.fillStyle = c
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      const s = 10
      ctx.fillRect(pt.x - s / 2, pt.y - s / 2, s, s)
      ctx.strokeRect(pt.x - s / 2, pt.y - s / 2, s, s)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 7px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(labels[pt.label] ?? '', pt.x, pt.y + 0.5)
    }
  }

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = canvas.width
    const h = canvas.height

    ctx.clearRect(0, 0, w, h)
    drawBackground(ctx, w, h)
    if (showGrid) drawGrid(ctx, w, h)

    if (showPathOfMotion) drawPathOfMotion(ctx)
    if (showOnionSkinning) drawOnionSkin(ctx)

    sortedShapes.sort((a, b) => a.zIndex - b.zIndex)

    for (const shape of sortedShapes) {
      ctx.save()
      ;(shape as any)._currentFrame = currentFrame

      if (!dragRef.current.interactingIds.has(shape.id)) {
        for (const track of animationTracks) {
          if (track.targetId !== shape.id) continue
          const val = getAnimatedValue(track.property, shape.id, currentFrame)
          if (val !== undefined) (shape as any)[track.property] = val
        }
      }

      FXPipeline.draw(shape, ctx)
      ctx.restore()
    }

    for (const sid of selectedShapeIds) {
      const shape = shapes.get(sid)
      if (shape) {
        drawTransformHandles(ctx, shape)
        drawControlPoints(ctx, shape)
      }
    }
  }, [shapes, layers, background, selectedShapeIds, animationTracks, currentFrame, showGrid, getAnimatedValue, totalFrames, showPathOfMotion, showOnionSkinning])

  useEffect(() => {
    render()
  }, [render, shapes, layers, background, selectedShapeIds, currentFrame, animationTracks, showGrid])

  const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    switch (background.type) {
      case 'solid':
        ctx.fillStyle = background.color ?? '#1a1a2e'
        ctx.fillRect(0, 0, w, h)
        break
      case 'gradient':
        if (background.gradient) {
          const g = ctx.createLinearGradient(0, 0, w, h)
          for (const stop of background.gradient.stops) {
            g.addColorStop(stop.offset, stop.color)
          }
          ctx.fillStyle = g
          ctx.fillRect(0, 0, w, h)
        }
        break
      case 'grid':
        ctx.fillStyle = background.color ?? '#1a1a2e'
        ctx.fillRect(0, 0, w, h)
        ctx.strokeStyle = background.gridColor ?? '#2a3a5e'
        ctx.lineWidth = 0.5
        const gs = background.gridSize ?? 40
        for (let x = 0; x <= w; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
        for (let y = 0; y <= h; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
        break
      case 'dots':
        ctx.fillStyle = background.dotColor ?? '#333'
        const ds = background.dotSpacing ?? 30
        const dr = background.dotRadius ?? 2
        for (let x = 0; x <= w; x += ds) {
          for (let y = 0; y <= h; y += ds) {
            ctx.beginPath(); ctx.arc(x, y, dr, 0, Math.PI * 2); ctx.fill()
          }
        }
        break
    }
  }

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = 'rgba(79, 142, 247, 0.15)'
    ctx.lineWidth = 0.5
    const step = 40
    for (let x = 0; x <= w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
    for (let y = 0; y <= h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
  }

  const getShapeAtPoint = (x: number, y: number): BaseShape | null => {
    const allShapes: BaseShape[] = []
    for (const [, layer] of layers) {
      if (!layer.data.visible) continue
      for (const sid of layer.shapes) {
        const s = shapes.get(sid)
        if (s) allShapes.push(s)
      }
    }
    allShapes.sort((a, b) => b.zIndex - a.zIndex)

    for (const shape of allShapes) {
      const bb = shape.getBoundingBox()
      const pad = 8
      if (x >= bb.x - pad && x <= bb.x + bb.width + pad &&
          y >= bb.y - pad && y <= bb.y + bb.height + pad) {
        return shape
      }
    }
    return null
  }

  const getControlPointAt = (x: number, y: number, shape: BaseShape): { field: string } | null => {
    const pts = getControlPoints(shape)
    const half = 8
    for (const pt of pts) {
      if (x >= pt.x - half && x <= pt.x + half && y >= pt.y - half && y <= pt.y + half) {
        return { field: pt.field }
      }
    }
    return null
  }

  const getTransformHandle = (x: number, y: number, shape: BaseShape): string | null => {
    const bb = shape.getBoundingBox()
    const cx = bb.x + bb.width / 2
    const cy = bb.y + bb.height / 2
    const handles: Record<string, { x: number; y: number }> = {
      'nw': { x: bb.x, y: bb.y },
      'n': { x: cx, y: bb.y },
      'ne': { x: bb.x + bb.width, y: bb.y },
      'e': { x: bb.x + bb.width, y: cy },
      'se': { x: bb.x + bb.width, y: bb.y + bb.height },
      's': { x: cx, y: bb.y + bb.height },
      'sw': { x: bb.x, y: bb.y + bb.height },
      'w': { x: bb.x, y: cy },
      'rotate': { x: cx, y: bb.y - 30 },
    }
    const half = HANDLE_SIZE + 4
    for (const [name, pos] of Object.entries(handles)) {
      if (x >= pos.x - half && x <= pos.x + half && y >= pos.y - half && y <= pos.y + half) {
        return name
      }
    }
    return null
  }

  const drawTransformHandles = (ctx: CanvasRenderingContext2D, shape: BaseShape) => {
    const bb = shape.getBoundingBox()
    const cx = bb.x + bb.width / 2
    const cy = bb.y + bb.height / 2

    ctx.strokeStyle = SELECTION_COLOR
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.strokeRect(bb.x - 2, bb.y - 2, bb.width + 4, bb.height + 4)
    ctx.setLineDash([])

    const corners = [
      { x: bb.x, y: bb.y },
      { x: cx, y: bb.y },
      { x: bb.x + bb.width, y: bb.y },
      { x: bb.x + bb.width, y: cy },
      { x: bb.x + bb.width, y: bb.y + bb.height },
      { x: cx, y: bb.y + bb.height },
      { x: bb.x, y: bb.y + bb.height },
      { x: bb.x, y: cy },
    ]
    for (const c of corners) {
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = HANDLE_COLOR
      ctx.lineWidth = 2
      ctx.fillRect(c.x - HANDLE_SIZE / 2, c.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE)
      ctx.strokeRect(c.x - HANDLE_SIZE / 2, c.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE)
    }

    ctx.strokeStyle = SELECTION_COLOR
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cx, bb.y - 22)
    ctx.lineTo(cx, bb.y - 6)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, bb.y - 24, 5, 0, Math.PI * 2)
    ctx.strokeStyle = '#F7A24F'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#F7A24F'
    ctx.fill()
  }

  const getCanvasPos = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getCanvasPos(e)
    const drag = dragRef.current

    if (activeTool === 'brush' || activeTool === 'eraser') {
      brushRef.current?.configure({
        mode: activeTool === 'eraser' ? 'eraser' : brushMode,
        brushSize: activeTool === 'eraser' ? brushSize * 3 : brushSize,
      })
      brushRef.current!.onStrokeComplete = (stroke) => addShape(stroke)
      brushRef.current!.onPointerDown(new PointerEvent('pointerdown', {
        clientX: e.clientX, clientY: e.clientY, pressure: 0.5,
      } as any), canvasRef.current!.getBoundingClientRect())
      drag.type = 'draw'
      return
    }

    if (activeTool === 'rect' || activeTool === 'circle' || activeTool === 'ellipse' ||
        activeTool === 'line' || activeTool === 'arrow' || activeTool === 'curve') {
      drag.type = 'draw'
      drag.drawStart = pos
      return
    }

    if (activeTool === 'select') {
      const selectedShapes = selectedShapeIds.map(id => shapes.get(id)).filter(Boolean) as BaseShape[]
      const topSelected = selectedShapes[selectedShapes.length - 1]

      if (topSelected) {
        const cp = getControlPointAt(pos.x, pos.y, topSelected)
        if (cp) {
          drag.type = 'controlPoint'
          drag.controlPoint = { shapeId: topSelected.id, field: cp.field }
          drag.startX = pos.x
          drag.startY = pos.y
          drag.interactingIds.add(topSelected.id)
          return
        }
        const handle = getTransformHandle(pos.x, pos.y, topSelected)
        if (handle) {
          const bb = topSelected.getBoundingBox()
          const orig = new Map<string, any>()
          orig.set(topSelected.id, {
            x: topSelected.x, y: topSelected.y,
            width: (topSelected as any).width ?? bb.width,
            height: (topSelected as any).height ?? bb.height,
            rotation: topSelected.rotation,
          })
          drag.type = handle === 'rotate' ? 'rotate' : 'resize'
          drag.handle = handle
          drag.interactingIds.add(topSelected.id)
          drag.startX = pos.x
          drag.startY = pos.y
          drag.originalShapes = orig
          return
        }
      }

      const shape = getShapeAtPoint(pos.x, pos.y)
      if (shape) {
        selectShape(shape.id, e.shiftKey)
        const bb = shape.getBoundingBox()
        const orig = new Map<string, any>()
        orig.set(shape.id, {
          x: shape.x, y: shape.y,
          x2: (shape as any).x2,
          y2: (shape as any).y2,
          width: (shape as any).width ?? bb.width,
          height: (shape as any).height ?? bb.height,
          rotation: shape.rotation,
        })
        drag.type = 'move'
        drag.interactingIds.add(shape.id)
        drag.startX = pos.x
        drag.startY = pos.y
        drag.originalShapes = orig
      } else {
        deselectAll()
      }
    }
  }, [activeTool, brushMode, brushSize, brushColor, brushOpacity, brushSmoothing, selectedShapeIds, shapes, addShape, selectShape, deselectAll, getCanvasPos])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getCanvasPos(e)
    const drag = dragRef.current

    if (drag.type === 'draw') {
      if (activeTool === 'brush' || activeTool === 'eraser') {
        brushRef.current?.onPointerMove(new PointerEvent('pointermove', {
          clientX: e.clientX, clientY: e.clientY, pressure: 0.5,
        } as any), canvasRef.current!.getBoundingClientRect())
      }
      return
    }

    if (drag.type === 'move' && drag.originalShapes.size > 0) {
      const dx = pos.x - drag.startX
      const dy = pos.y - drag.startY
      const grid = snapToGrid ? 20 : 0
      for (const [sid, orig] of drag.originalShapes) {
        let nx = orig.x + dx
        let ny = orig.y + dy
        if (grid) { nx = Math.round(nx / grid) * grid; ny = Math.round(ny / grid) * grid }
        const deltaX = nx - orig.x
        const deltaY = ny - orig.y
        const update: Record<string, any> = { x: nx, y: ny }
        if (orig.x2 !== undefined) update.x2 = orig.x2 + deltaX
        if (orig.y2 !== undefined) update.y2 = orig.y2 + deltaY
        updateShape(sid, update as any)
      }
      return
    }

    if (drag.type === 'resize' && drag.handle && drag.originalShapes.size > 0) {
      const entry = drag.originalShapes.entries().next().value
      if (!entry) return
      const [sid, orig] = entry
      const dx = pos.x - drag.startX
      const dy = pos.y - drag.startY
      const handle = drag.handle!
      let newW = orig.width!
      let newH = orig.height!
      let newX = orig.x!
      let newY = orig.y!

      if (handle.includes('e')) newW = Math.max(10, orig.width! + dx)
      if (handle.includes('w')) { newW = Math.max(10, orig.width! - dx); newX = orig.x! + (orig.width! - newW) }
      if (handle.includes('s')) newH = Math.max(10, orig.height! + dy)
      if (handle.includes('n')) { newH = Math.max(10, orig.height! - dy); newY = orig.y! + (orig.height! - newH) }

      updateShape(sid, { x: newX, y: newY } as any)
      const shape = shapes.get(sid)
      if (shape && 'width' in shape) updateShape(sid, { width: newW } as any)
      if (shape && 'height' in shape) updateShape(sid, { height: newH } as any)
      return
    }

    if (drag.type === 'rotate' && drag.originalShapes.size > 0) {
      const entry = drag.originalShapes.entries().next().value
      if (!entry) return
      const [sid, orig] = entry
      const shape = shapes.get(sid)
      if (!shape) return
      const bb = shape.getBoundingBox()
      const cx = orig.x! + (orig.width || bb.width) / 2
      const cy = orig.y! + (orig.height || bb.height) / 2
      const startAngle = Math.atan2(drag.startY - cy, drag.startX - cx)
      const currentAngle = Math.atan2(pos.y - cy, pos.x - cx)
      const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI)
      updateShape(sid, { rotation: (orig.rotation ?? 0) + deltaAngle } as any)
      drag.startX = pos.x
      drag.startY = pos.y
      orig.rotation = (orig.rotation ?? 0) + deltaAngle
      return
    }

    if (drag.type === 'none' && activeTool === 'select' && canvasRef.current) {
      const shape = getShapeAtPoint(pos.x, pos.y)
      if (shape) {
        const onHandle = getTransformHandle(pos.x, pos.y, shape)
        const onCP = getControlPointAt(pos.x, pos.y, shape)
        canvasRef.current.style.cursor = onHandle ? (onHandle === 'rotate' ? 'grab' : 'nw-resize') :
          onCP ? 'pointer' : 'move'
      } else {
        canvasRef.current.style.cursor = 'default'
      }
    }

    if (drag.type === 'controlPoint' && drag.controlPoint) {
      const shape = shapes.get(drag.controlPoint.shapeId)
      if (!shape) return
      const update: Record<string, any> = {}
      const field = drag.controlPoint.field
      const lx = pos.x - shape.x
      const ly = pos.y - shape.y
      if (field === 'start') { update.startX = lx; update.startY = ly }
      else if (field === 'end') { update.endX = lx; update.endY = ly }
      else if (field === 'cp1') { update.cp1x = lx; update.cp1y = ly }
      else if (field === 'cp2') { update.cp2x = lx; update.cp2y = ly }
      updateShape(drag.controlPoint.shapeId, update as any)
    }
  }, [activeTool, snapToGrid, shapes, updateShape, getCanvasPos])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const drag = dragRef.current
    const pos = getCanvasPos(e)

    if (drag.type === 'draw' && drag.drawStart) {
      const sx = Math.min(drag.drawStart.x, pos.x)
      const sy = Math.min(drag.drawStart.y, pos.y)
      const w = Math.abs(pos.x - drag.drawStart.x)
      const h = Math.abs(pos.y - drag.drawStart.y)

      if (w > 5 || h > 5) {
        switch (activeTool) {
          case 'rect': {
            const s = ShapeFactory.createShape('rect', {
              name: 'Rectangle', x: sx, y: sy,
              fillColor: '#4F8EF7', strokeColor: '#ffffff', strokeWidth: 2,
            }) as any
            s.width = w; s.height = h
            addShape(s)
            break
          }
          case 'circle': {
            const r = Math.max(w, h) / 2
            const s = ShapeFactory.createShape('circle', {
              name: 'Circle', x: drag.drawStart.x - r, y: drag.drawStart.y - r,
              fillColor: '#4F8EF7', strokeColor: '#ffffff', strokeWidth: 2,
            }) as any
            s.radius = r
            addShape(s)
            break
          }
          case 'line': {
            const s = ShapeFactory.createShape('line', {
              name: 'Line', x: drag.drawStart.x, y: drag.drawStart.y,
              strokeColor: '#ffffff', strokeWidth: 3,
            }) as any
            s.endX = pos.x - drag.drawStart.x; s.endY = pos.y - drag.drawStart.y
            addShape(s)
            break
          }
          case 'arrow': {
            const s = ShapeFactory.createShape('line', {
              name: 'Arrow', x: drag.drawStart.x, y: drag.drawStart.y,
              strokeColor: '#ffffff', strokeWidth: 3,
            }) as any
            s.endX = pos.x - drag.drawStart.x; s.endY = pos.y - drag.drawStart.y; s.capStyle = 'arrow'
            addShape(s)
            break
          }
          case 'curve': {
            const s = ShapeFactory.createShape('curve', {
              name: 'Curve', x: drag.drawStart.x, y: drag.drawStart.y,
              strokeColor: '#ffffff', strokeWidth: 3,
            }) as any
            const dx = pos.x - drag.drawStart.x
            const dy = pos.y - drag.drawStart.y
            s.endX = dx; s.endY = dy
            s.cp1x = dx * 0.3; s.cp1y = -dy * 0.3
            s.cp2x = dx * 0.7; s.cp2y = dy * 1.3
            addShape(s)
            break
          }
        }
      }
    }

    if (drag.type === 'draw' && (activeTool === 'brush' || activeTool === 'eraser')) {
      brushRef.current?.onPointerUp()
    }

    if (drag.type === 'move' || drag.type === 'resize' || drag.type === 'rotate') {
      for (const sid of drag.interactingIds) {
        const shape = shapes.get(sid)
        if (!shape) continue
        const tracks = animationTracks.filter(t => t.targetId === sid)
        if (tracks.length === 0) continue
        for (const track of tracks) {
          const props: Record<string, any> = {}
          if (track.property === 'x' || track.property === 'y') {
            props.x = shape.x
            props.y = shape.y
          } else {
            props[track.property] = (shape as any)[track.property]
          }
          addKeyframe(track.id, { frame: currentFrame, properties: props })
        }
      }
    }

    drag.type = 'none'
    drag.originalShapes = new Map()
    drag.handle = undefined
    drag.drawStart = undefined
    drag.controlPoint = undefined
    drag.interactingIds.clear()
  }, [activeTool, addShape, getCanvasPos, animationTracks, addKeyframe, currentFrame, shapes])

  return (
    <div
      ref={containerRef}
      style={{ flex: 1, display: 'flex', alignItems: 'stretch', justifyContent: 'stretch', background: '#0d0d1a', overflow: 'hidden', position: 'relative' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: activeTool === 'brush' || activeTool === 'eraser' ? 'crosshair' :
                  activeTool === 'select' ? 'default' : 'crosshair',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { dragRef.current.type = 'none'; dragRef.current.originalShapes = new Map() }}
      />
    </div>
  )
}
