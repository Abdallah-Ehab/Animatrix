import { BaseShape } from '../shapes/BaseShape'
import { FXPipeline } from '../fx/FXPipeline'
import { AnimationSystem } from '../animations/AnimationSystem'
import { Background } from '../../store/sceneStore'

export class RenderEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationSystem: AnimationSystem
  private shapes: Map<string, BaseShape> = new Map()
  private layers: Map<string, { zIndex: number; shapes: BaseShape[] }> = new Map()
  private background: Background = { type: 'solid', color: '#1a1a2e' }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.animationSystem = new AnimationSystem()
  }

  setAnimationSystem(system: AnimationSystem): void {
    this.animationSystem = system
  }

  setShapes(shapes: Map<string, BaseShape>): void {
    this.shapes = shapes
  }

  setLayers(layers: Map<string, { zIndex: number; shapes: BaseShape[] }>): void {
    this.layers = layers
  }

  setBackground(bg: Background): void {
    this.background = bg
  }

  render(frame: number): void {
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height

    ctx.clearRect(0, 0, w, h)
    this.drawBackground(ctx, w, h)

    this.animationSystem.applyAll(this.shapes, frame)

    const sortedLayers = Array.from(this.layers.values()).sort((a, b) => a.zIndex - b.zIndex)
    for (const layer of sortedLayers) {
      for (const shape of layer.shapes) {
        ctx.save()
        shape.applyTransform(ctx)
        FXPipeline.draw(shape, ctx)
        ctx.restore()
      }
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    switch (this.background.type) {
      case 'solid':
        ctx.fillStyle = this.background.color ?? '#1a1a2e'
        ctx.fillRect(0, 0, w, h)
        break
      case 'gradient':
        if (this.background.gradient) {
          const g = this.background.gradient
          const gradient = ctx.createLinearGradient(0, 0, w, h)
          for (const stop of g.stops) {
            gradient.addColorStop(stop.offset, stop.color)
          }
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, w, h)
        }
        break
      case 'grid':
        ctx.fillStyle = this.background.color ?? '#1a1a2e'
        ctx.fillRect(0, 0, w, h)
        ctx.strokeStyle = this.background.gridColor ?? '#2a3a5e'
        ctx.lineWidth = 0.5
        const gs = this.background.gridSize ?? 40
        for (let x = 0; x <= w; x += gs) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, h)
          ctx.stroke()
        }
        for (let y = 0; y <= h; y += gs) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(w, y)
          ctx.stroke()
        }
        break
      case 'dots':
        ctx.fillStyle = this.background.dotColor ?? '#000000'
        const ds = this.background.dotSpacing ?? 30
        const dr = this.background.dotRadius ?? 2
        for (let x = 0; x <= w; x += ds) {
          for (let y = 0; y <= h; y += ds) {
            ctx.beginPath()
            ctx.arc(x, y, dr, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        break
    }
  }
}
