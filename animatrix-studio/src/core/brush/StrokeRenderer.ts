import { BrushStroke } from '../shapes/BaseShape'

export class StrokeRenderer {
  static render(ctx: CanvasRenderingContext2D, stroke: BrushStroke): void {
    if (stroke.points.length < 2) return

    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const mode = stroke.mode ?? 'pen'

    if (mode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.lineWidth = stroke.brushSize * 3
      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
      }
      ctx.stroke()
      ctx.restore()
      return
    }

    ctx.globalAlpha = stroke.opacity ?? 1

    switch (mode) {
      case 'marker':
        ctx.strokeStyle = stroke.strokeColor
        ctx.lineWidth = stroke.brushSize * 1.5
        ctx.globalAlpha = (stroke.opacity ?? 1) * 0.7
        ctx.beginPath()
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
        }
        ctx.stroke()
        break

      case 'chalk':
        ctx.strokeStyle = stroke.strokeColor
        ctx.lineWidth = stroke.brushSize
        ctx.globalAlpha = (stroke.opacity ?? 1) * 0.5
        for (let i = 0; i < stroke.points.length - 1; i++) {
          const p = stroke.points[i]
          const np = stroke.points[i + 1]
          const steps = Math.max(2, Math.floor(ctx.lineWidth / 2))
          for (let s = 0; s < steps; s++) {
            const t = s / steps
            const x = p.x + (np.x - p.x) * t + (Math.random() - 0.5) * 4
            const y = p.y + (np.y - p.y) * t + (Math.random() - 0.5) * 4
            const r = stroke.brushSize / 2 + (Math.random() - 0.5) * 3
            ctx.beginPath()
            ctx.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2)
            ctx.fill()
          }
        }
        break

      case 'ink':
        for (let i = 0; i < stroke.points.length - 1; i++) {
          const t = i / Math.max(stroke.points.length - 1, 1)
          const taper = t < 0.1 ? t * 10 : t > 0.9 ? (1 - t) * 10 : 1
          const width = Math.max(0.5, stroke.brushSize * taper)
          ctx.strokeStyle = stroke.strokeColor
          ctx.lineWidth = width
          ctx.beginPath()
          ctx.moveTo(stroke.points[i].x, stroke.points[i].y)
          ctx.lineTo(stroke.points[i + 1].x, stroke.points[i + 1].y)
          ctx.stroke()
        }
        break

      case 'pen':
      default:
        ctx.strokeStyle = stroke.strokeColor
        ctx.lineWidth = stroke.brushSize
        ctx.beginPath()
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
        }
        ctx.stroke()
        break
    }

    ctx.restore()
  }
}
