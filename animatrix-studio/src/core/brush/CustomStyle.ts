import { BrushStroke, BoundingBox } from '../shapes/BaseShape'

export class CustomStyle {
  id: string
  name: string
  strokes: BrushStroke[]
  boundingBox: BoundingBox
  targetShapeType: string

  constructor(options: { id: string; name: string; strokes: BrushStroke[]; boundingBox: BoundingBox; targetShapeType: string }) {
    this.id = options.id
    this.name = options.name
    this.strokes = options.strokes
    this.boundingBox = options.boundingBox
    this.targetShapeType = options.targetShapeType
  }

  render(ctx: CanvasRenderingContext2D, targetBox: BoundingBox): void {
    if (this.strokes.length === 0) return
    const sw = this.boundingBox.width || 1
    const sh = this.boundingBox.height || 1
    const scaleX = targetBox.width / sw
    const scaleY = targetBox.height / sh

    ctx.save()
    ctx.translate(targetBox.x, targetBox.y)
    ctx.scale(scaleX, scaleY)
    ctx.translate(-this.boundingBox.x, -this.boundingBox.y)

    for (const stroke of this.strokes) {
      stroke.draw(ctx)
    }
    ctx.restore()
  }

  static record(strokes: BrushStroke[], targetShapeType: string): CustomStyle {
    const allPoints = strokes.flatMap(s => s.points)
    const xs = allPoints.map(p => p.x)
    const ys = allPoints.map(p => p.y)
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    const maxX = Math.max(...xs)
    const maxY = Math.max(...ys)

    return new CustomStyle({
      id: crypto.randomUUID(),
      name: `Style ${Date.now()}`,
      strokes,
      boundingBox: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
      targetShapeType,
    })
  }
}
