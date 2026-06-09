import { BaseShape, BoundingBox } from '../BaseShape'
import type { CapStyle } from '../../../constants'

export class RectShape extends BaseShape {
  width: number
  height: number
  cornerRadius: number

  constructor(options: Partial<RectShape> & { name: string }) {
    super(options)
    this.width = options.width ?? 100
    this.height = options.height ?? 100
    this.cornerRadius = options.cornerRadius ?? 0
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const r = Math.min(this.cornerRadius, this.width / 2, this.height / 2)
    ctx.beginPath()
    ctx.moveTo(this.x + r, this.y)
    ctx.lineTo(this.x + this.width - r, this.y)
    ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + r)
    ctx.lineTo(this.x + this.width, this.y + this.height - r)
    ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - r, this.y + this.height)
    ctx.lineTo(this.x + r, this.y + this.height)
    ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - r)
    ctx.lineTo(this.x, this.y + r)
    ctx.quadraticCurveTo(this.x, this.y, this.x + r, this.y)
    ctx.closePath()
    if (this.fillColor && this.fillColor !== 'none') {
      ctx.fillStyle = this.fillColor
      ctx.fill()
    }
    if (this.strokeColor && this.strokeColor !== 'none') {
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = this.strokeWidth
      ctx.stroke()
    }
  }

  getBoundingBox(): BoundingBox {
    return { x: this.x, y: this.y, width: this.width, height: this.height }
  }

  clone(): RectShape {
    return new RectShape({ ...this, id: undefined })
  }

  serialize(): object {
    return { type: 'rect', ...this }
  }
}

export class CircleShape extends BaseShape {
  radius: number
  startAngle: number
  endAngle: number

  constructor(options: Partial<CircleShape> & { name: string }) {
    super(options)
    this.radius = options.radius ?? 50
    this.startAngle = options.startAngle ?? 0
    this.endAngle = options.endAngle ?? 360
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const sa = (this.startAngle * Math.PI) / 180
    const ea = (this.endAngle * Math.PI) / 180
    ctx.beginPath()
    ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, sa, ea)
    ctx.closePath()
    if (this.fillColor && this.fillColor !== 'none') {
      ctx.fillStyle = this.fillColor
      ctx.fill()
    }
    if (this.strokeColor && this.strokeColor !== 'none') {
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = this.strokeWidth
      ctx.stroke()
    }
  }

  getBoundingBox(): BoundingBox {
    return { x: this.x, y: this.y, width: this.radius * 2, height: this.radius * 2 }
  }

  clone(): CircleShape {
    return new CircleShape({ ...this, id: undefined })
  }

  serialize(): object {
    return { type: 'circle', ...this }
  }
}

export class EllipseShape extends BaseShape {
  radiusX: number
  radiusY: number

  constructor(options: Partial<EllipseShape> & { name: string }) {
    super(options)
    this.radiusX = options.radiusX ?? 60
    this.radiusY = options.radiusY ?? 40
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath()
    ctx.ellipse(this.x + this.radiusX, this.y + this.radiusY, this.radiusX, this.radiusY, 0, 0, Math.PI * 2)
    ctx.closePath()
    if (this.fillColor && this.fillColor !== 'none') {
      ctx.fillStyle = this.fillColor
      ctx.fill()
    }
    if (this.strokeColor && this.strokeColor !== 'none') {
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = this.strokeWidth
      ctx.stroke()
    }
  }

  getBoundingBox(): BoundingBox {
    return { x: this.x, y: this.y, width: this.radiusX * 2, height: this.radiusY * 2 }
  }

  clone(): EllipseShape {
    return new EllipseShape({ ...this, id: undefined })
  }

  serialize(): object {
    return { type: 'ellipse', ...this }
  }
}

export class LineShape extends BaseShape {
  startX: number
  startY: number
  endX: number
  endY: number
  drawProgress: number
  capStyle: CapStyle

  constructor(options: Partial<LineShape> & { name: string }) {
    super(options)
    const o = options as any
    this.startX = options.startX ?? 0
    this.startY = options.startY ?? 0
    this.endX = options.endX ?? (o.x2 !== undefined ? o.x2 - (options.x ?? 0) : 200)
    this.endY = options.endY ?? (o.y2 !== undefined ? o.y2 - (options.y ?? 0) : 200)
    this.drawProgress = options.drawProgress ?? 1
    this.capStyle = options.capStyle ?? 'none'
  }

  getWorldStart(): { x: number; y: number } {
    return { x: this.x + this.startX, y: this.y + this.startY }
  }

  getWorldEnd(): { x: number; y: number } {
    return { x: this.x + this.endX, y: this.y + this.endY }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const ws = this.getWorldStart()
    const we = this.getWorldEnd()
    const dx = we.x - ws.x
    const dy = we.y - ws.y
    const endX = ws.x + dx * this.drawProgress
    const endY = ws.y + dy * this.drawProgress

    ctx.beginPath()
    ctx.moveTo(ws.x, ws.y)
    ctx.lineTo(endX, endY)
    ctx.strokeStyle = this.strokeColor
    ctx.lineWidth = this.strokeWidth
    ctx.lineCap = 'round'
    ctx.stroke()

    if (this.capStyle === 'arrow') {
      this.drawArrowhead(ctx, endX, endY, dx, dy)
    } else if (this.capStyle === 'dot') {
      ctx.beginPath()
      ctx.arc(endX, endY, this.strokeWidth * 2, 0, Math.PI * 2)
      ctx.fillStyle = this.strokeColor
      ctx.fill()
    }
  }

  private drawArrowhead(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number): void {
    const angle = Math.atan2(dy, dx)
    const headLen = 15
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x - headLen * Math.cos(angle - Math.PI / 6), y - headLen * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(x - headLen * Math.cos(angle + Math.PI / 6), y - headLen * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fillStyle = this.strokeColor
    ctx.fill()
  }

  getBoundingBox(): BoundingBox {
    const ws = this.getWorldStart()
    const we = this.getWorldEnd()
    const minX = Math.min(ws.x, we.x)
    const minY = Math.min(ws.y, we.y)
    return { x: minX, y: minY, width: Math.abs(we.x - ws.x), height: Math.abs(we.y - ws.y) }
  }

  clone(): LineShape {
    return new LineShape({ ...this, id: undefined })
  }

  serialize(): object {
    const { startX, startY, endX, endY, drawProgress, capStyle, ...rest } = this as any
    return { type: 'line', startX, startY, endX, endY, drawProgress, capStyle }
  }
}

export class CurveShape extends LineShape {
  cp1x: number
  cp1y: number
  cp2x: number
  cp2y: number
  points: { x: number; y: number }[]

  constructor(options: Partial<CurveShape> & { name: string }) {
    super(options)
    this.cp1x = options.cp1x ?? 100
    this.cp1y = options.cp1y ?? 0
    this.cp2x = options.cp2x ?? 200
    this.cp2y = options.cp2y ?? 300
    this.points = options.points ?? []
  }

  getWorldCP1(): { x: number; y: number } {
    return { x: this.x + this.cp1x, y: this.y + this.cp1y }
  }

  getWorldCP2(): { x: number; y: number } {
    return { x: this.x + this.cp2x, y: this.y + this.cp2y }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const ws = this.getWorldStart()
    const we = this.getWorldEnd()
    if (this.points.length >= 2) {
      const count = Math.floor(this.points.length * this.drawProgress)
      const visible = this.points.slice(0, Math.max(2, count))
      ctx.beginPath()
      ctx.moveTo(visible[0].x, visible[0].y)
      for (let i = 1; i < visible.length; i++) {
        ctx.lineTo(visible[i].x, visible[i].y)
      }
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = this.strokeWidth
      ctx.stroke()
    } else {
      const wcp1 = this.getWorldCP1()
      const wcp2 = this.getWorldCP2()
      const endT = this.drawProgress
      ctx.beginPath()
      ctx.moveTo(ws.x, ws.y)
      ctx.bezierCurveTo(
        wcp1.x, wcp1.y,
        wcp2.x, wcp2.y,
        ws.x + (we.x - ws.x) * endT,
        ws.y + (we.y - ws.y) * endT
      )
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = this.strokeWidth
      ctx.stroke()
    }
  }

  clone(): CurveShape {
    return new CurveShape({ ...this, id: undefined, points: this.points.map(p => ({ ...p })) })
  }

  serialize(): object {
    const { cp1x, cp1y, cp2x, cp2y, points, ...rest } = this as any
    return { type: 'curve', cp1x, cp1y, cp2x, cp2y, points, ...rest }
  }
}

export class ArrowShape extends LineShape {
  headSize: number
  headStyle: string

  constructor(options: Partial<ArrowShape> & { name: string }) {
    super(options)
    this.headSize = options.headSize ?? 15
    this.headStyle = options.headStyle ?? 'filled'
  }

  draw(ctx: CanvasRenderingContext2D): void {
    super.draw(ctx)
    const ws = this.getWorldStart()
    const we = this.getWorldEnd()
    const dx = we.x - ws.x
    const dy = we.y - ws.y
    const angle = Math.atan2(dy, dx)
    const len = Math.sqrt(dx * dx + dy * dy) * this.drawProgress
    const endX = ws.x + (dx / Math.sqrt(dx * dx + dy * dy)) * len
    const endY = ws.y + (dy / Math.sqrt(dx * dx + dy * dy)) * len

    ctx.beginPath()
    ctx.moveTo(endX, endY)
    ctx.lineTo(endX - this.headSize * Math.cos(angle - Math.PI / 6), endY - this.headSize * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(endX - this.headSize * Math.cos(angle + Math.PI / 6), endY - this.headSize * Math.sin(angle + Math.PI / 6))
    ctx.closePath()

    if (this.headStyle === 'filled' || this.headStyle === 'double') {
      ctx.fillStyle = this.strokeColor
      ctx.fill()
    }
    if (this.headStyle === 'outline' || this.headStyle === 'double') {
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  clone(): ArrowShape {
    return new ArrowShape({ ...this, id: undefined })
  }

  serialize(): object {
    return { type: 'arrow', ...this }
  }
}

export class TextShape extends BaseShape {
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: string
  align: string
  textColor: string

  constructor(options: Partial<TextShape> & { name: string }) {
    super(options)
    this.text = options.text ?? 'Text'
    this.fontFamily = options.fontFamily ?? 'Arial'
    this.fontSize = options.fontSize ?? 24
    this.fontWeight = options.fontWeight ?? 'normal'
    this.align = options.align ?? 'left'
    this.textColor = options.textColor ?? options.strokeColor ?? '#ffffff'
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.font = `${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`
    ctx.textAlign = this.align as CanvasTextAlign
    ctx.textBaseline = 'top'
    ctx.fillStyle = this.textColor
    const lines = this.text.split('\n')
    lines.forEach((line, i) => {
      ctx.fillText(line, this.x, this.y + i * (this.fontSize * 1.3))
    })
  }

  getBoundingBox(): BoundingBox {
    return { x: this.x, y: this.y, width: this.text.length * this.fontSize * 0.6, height: this.fontSize * 1.3 }
  }

  clone(): TextShape {
    return new TextShape({ ...this, id: undefined })
  }

  serialize(): object {
    return { type: 'text', ...this }
  }
}

export class PolygonShape extends BaseShape {
  sides: number
  radius: number

  constructor(options: Partial<PolygonShape> & { name: string }) {
    super(options)
    this.sides = options.sides ?? 6
    this.radius = options.radius ?? 50
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.radius
    const cy = this.y + this.radius
    ctx.beginPath()
    for (let i = 0; i <= this.sides; i++) {
      const angle = (i / this.sides) * Math.PI * 2 - Math.PI / 2
      const px = cx + this.radius * Math.cos(angle)
      const py = cy + this.radius * Math.sin(angle)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    if (this.fillColor && this.fillColor !== 'none') {
      ctx.fillStyle = this.fillColor
      ctx.fill()
    }
    if (this.strokeColor && this.strokeColor !== 'none') {
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = this.strokeWidth
      ctx.stroke()
    }
  }

  getBoundingBox(): BoundingBox {
    return { x: this.x, y: this.y, width: this.radius * 2, height: this.radius * 2 }
  }

  clone(): PolygonShape {
    return new PolygonShape({ ...this, id: undefined })
  }

  serialize(): object {
    return { type: 'polygon', ...this }
  }
}

export class GroupShape extends BaseShape {
  children: BaseShape[]

  constructor(options: Partial<GroupShape> & { name: string }) {
    super(options)
    this.children = options.children ?? []
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    for (const child of this.children) {
      child.draw(ctx)
    }
    ctx.restore()
  }

  getBoundingBox(): BoundingBox {
    if (this.children.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
    const boxes = this.children.map(c => c.getBoundingBox())
    const minX = Math.min(...boxes.map(b => b.x))
    const minY = Math.min(...boxes.map(b => b.y))
    const maxX = Math.max(...boxes.map(b => b.x + b.width))
    const maxY = Math.max(...boxes.map(b => b.y + b.height))
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
  }

  clone(): GroupShape {
    return new GroupShape({ ...this, id: undefined, children: this.children.map(c => c.clone()) })
  }

  serialize(): object {
    return { type: 'group', ...this, children: this.children.map(c => c.serialize()) }
  }
}
