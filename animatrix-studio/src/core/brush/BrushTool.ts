import { BrushStroke, StrokePoint } from '../shapes/BaseShape'
import { chaikinSmooth } from '../../utils/bezierUtils'
import type { BrushMode } from '../../constants'

export class BrushTool {
  mode: BrushMode
  brushSize: number
  color: string
  opacity: number
  smoothing: number
  isDrawing: boolean
  currentPoints: StrokePoint[]
  onStrokeComplete?: (stroke: BrushStroke) => void

  constructor(options: Partial<BrushTool> = {}) {
    this.mode = options.mode ?? 'pen'
    this.brushSize = options.brushSize ?? 8
    this.color = options.color ?? '#ffffff'
    this.opacity = options.opacity ?? 1
    this.smoothing = options.smoothing ?? 0.5
    this.isDrawing = false
    this.currentPoints = []
  }

  onPointerDown(e: PointerEvent, canvasRect: DOMRect): void {
    this.isDrawing = true
    this.currentPoints = [this.makePoint(e, canvasRect)]
  }

  onPointerMove(e: PointerEvent, canvasRect: DOMRect): void {
    if (!this.isDrawing) return
    this.currentPoints.push(this.makePoint(e, canvasRect))
  }

  onPointerUp(): void {
    if (!this.isDrawing) return
    this.isDrawing = false
    const rawPoints = [...this.currentPoints]
    const iterCount = Math.max(1, Math.round(this.smoothing * 4))
    const smoothedPts = chaikinSmooth(rawPoints, iterCount)
    const strokePoints: StrokePoint[] = smoothedPts.map((p, i) => ({
      x: p.x,
      y: p.y,
      pressure: rawPoints[Math.min(i, rawPoints.length - 1)]?.pressure ?? 0.5,
      timestamp: Date.now(),
    }))

    const stroke = new BrushStroke({
      name: `Brush ${Date.now()}`,
      mode: this.mode,
      points: strokePoints,
      brushSize: this.brushSize,
      opacity: this.opacity,
      smoothing: this.smoothing,
      strokeColor: this.color,
      fillColor: 'none',
    })
    this.onStrokeComplete?.(stroke)
    this.currentPoints = []
  }

  configure(options: Partial<BrushTool>): void {
    if (options.mode !== undefined) this.mode = options.mode
    if (options.brushSize !== undefined) this.brushSize = options.brushSize
    if (options.color !== undefined) this.color = options.color
    if (options.opacity !== undefined) this.opacity = options.opacity
    if (options.smoothing !== undefined) this.smoothing = options.smoothing
  }

  private makePoint(e: PointerEvent, rect: DOMRect): StrokePoint {
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
      timestamp: Date.now(),
    }
  }
}
