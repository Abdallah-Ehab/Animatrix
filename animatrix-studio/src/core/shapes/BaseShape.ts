import { v4 as uuid } from 'uuid'
import type { FXConfig } from '../fx/FXPipeline'

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export abstract class BaseShape {
  id: string
  name: string
  layer: string
  zIndex: number

  x: number
  y: number
  rotation: number
  scaleX: number
  scaleY: number

  fillColor: string
  strokeColor: string
  strokeWidth: number
  opacity: number
  customStyle?: CustomStyle

  fx: FXConfig[]

  animatedState: Record<string, any>

  constructor(options: Partial<BaseShape> & { name: string }) {
    this.id = options.id ?? uuid()
    this.name = options.name
    this.layer = options.layer ?? 'default'
    this.zIndex = options.zIndex ?? 0
    this.x = options.x ?? 0
    this.y = options.y ?? 0
    this.rotation = options.rotation ?? 0
    this.scaleX = options.scaleX ?? 1
    this.scaleY = options.scaleY ?? 1
    this.fillColor = options.fillColor ?? 'none'
    this.strokeColor = options.strokeColor ?? '#ffffff'
    this.strokeWidth = options.strokeWidth ?? 2
    this.opacity = options.opacity ?? 1
    this.customStyle = options.customStyle
    this.fx = options.fx ?? []
    this.animatedState = options.animatedState ?? {}
  }

  abstract draw(ctx: CanvasRenderingContext2D): void
  abstract getBoundingBox(): BoundingBox
  abstract clone(): BaseShape
  abstract serialize(): object

  static deserialize(data: Record<string, unknown>): BaseShape {
    throw new Error('deserialize must be implemented by subclass')
  }

  applyTransform(ctx: CanvasRenderingContext2D): void {
    const bb = this.getBoundingBox()
    const cx = bb.x + bb.width / 2
    const cy = bb.y + bb.height / 2
    ctx.translate(cx, cy)
    ctx.rotate((this.rotation * Math.PI) / 180)
    ctx.scale(this.scaleX, this.scaleY)
    ctx.translate(-cx, -cy)
  }
}

export interface StrokePoint {
  x: number
  y: number
  pressure: number
  timestamp: number
}

export class BrushStroke extends BaseShape {
  mode: string
  points: StrokePoint[]
  brushSize: number
  smoothing: number

  constructor(options: Partial<BrushStroke> & { name: string }) {
    super(options)
    this.mode = options.mode ?? 'pen'
    this.points = options.points ?? []
    this.brushSize = options.brushSize ?? 8
    this.smoothing = options.smoothing ?? 0.5
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.points.length < 2) return
    ctx.beginPath()
    ctx.moveTo(this.points[0].x, this.points[0].y)
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y)
    }
    ctx.strokeStyle = this.strokeColor
    ctx.lineWidth = this.brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  getBoundingBox(): BoundingBox {
    if (this.points.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
    const xs = this.points.map(p => p.x)
    const ys = this.points.map(p => p.y)
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    const maxX = Math.max(...xs)
    const maxY = Math.max(...ys)
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
  }

  clone(): BrushStroke {
    return new BrushStroke({
      ...this,
      id: undefined,
      points: this.points.map(p => ({ ...p })),
    })
  }

  serialize(): object {
    return { type: 'brushStroke', ...this, points: this.points }
  }
}

export interface CustomStyle {
  id: string
  name: string
  strokes: BrushStroke[]
  boundingBox: BoundingBox
  targetShapeType: string

  render(ctx: CanvasRenderingContext2D, targetBox: BoundingBox): void
}
