import { BaseShape } from '../shapes/BaseShape'

export interface OuterGlowFX { type: 'outerGlow'; color: string; blur: number; spread: number; opacity: number }
export interface InnerGlowFX { type: 'innerGlow'; color: string; blur: number; opacity: number }
export interface DropShadowFX { type: 'dropShadow'; color: string; offsetX: number; offsetY: number; blur: number; opacity: number }
export interface StrokeGlowFX { type: 'strokeGlow'; color: string; blur: number; layers: number }
export interface ColorOverlayFX { type: 'colorOverlay'; color: string; opacity: number }
export interface BlurFX { type: 'blur'; radius: number }

export type FXConfig = OuterGlowFX | InnerGlowFX | DropShadowFX | StrokeGlowFX | ColorOverlayFX | BlurFX

export class FXPipeline {
  static draw(shape: BaseShape, ctx: CanvasRenderingContext2D): void {
    ctx.save()
    if (shape.opacity !== undefined) {
      ctx.globalAlpha = shape.animatedState?.opacity ?? shape.opacity
    }

    shape.applyTransform(ctx)

    this.applyPreFX(shape, ctx)
    if (shape.customStyle) {
      shape.customStyle.render(ctx, shape.getBoundingBox())
    } else {
      shape.draw(ctx)
    }
    this.applyPostFX(shape, ctx)
    ctx.restore()
  }

  private static applyPreFX(shape: BaseShape, ctx: CanvasRenderingContext2D): void {
    for (const fx of shape.fx) {
      switch (fx.type) {
        case 'dropShadow':
          this.applyDropShadow(ctx, fx)
          break
        case 'outerGlow':
          this.applyOuterGlow(ctx, fx)
          break
      }
    }
  }

  private static applyPostFX(shape: BaseShape, ctx: CanvasRenderingContext2D): void {
    for (const fx of shape.fx) {
      switch (fx.type) {
        case 'innerGlow':
          this.applyInnerGlow(ctx, fx, shape)
          break
        case 'strokeGlow':
          this.applyStrokeGlow(ctx, fx, shape)
          break
        case 'colorOverlay':
          this.applyColorOverlay(ctx, fx, shape)
          break
        case 'blur':
          this.applyBlur(ctx, fx, shape)
          break
      }
    }
  }

  private static applyDropShadow(ctx: CanvasRenderingContext2D, fx: DropShadowFX): void {
    ctx.shadowColor = fx.color
    ctx.shadowBlur = fx.blur
    ctx.shadowOffsetX = fx.offsetX
    ctx.shadowOffsetY = fx.offsetY
  }

  private static applyOuterGlow(ctx: CanvasRenderingContext2D, fx: OuterGlowFX): void {
    ctx.shadowColor = fx.color
    ctx.shadowBlur = fx.blur
    ctx.globalAlpha = fx.opacity
  }

  private static applyInnerGlow(ctx: CanvasRenderingContext2D, fx: InnerGlowFX, shape: BaseShape): void {
    ctx.save()
    const bb = shape.getBoundingBox()
    const gradient = ctx.createRadialGradient(
      bb.x + bb.width / 2, bb.y + bb.height / 2, 0,
      bb.x + bb.width / 2, bb.y + bb.height / 2, Math.max(bb.width, bb.height) / 2
    )
    gradient.addColorStop(0, fx.color)
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.globalAlpha = fx.opacity
    ctx.fillRect(bb.x, bb.y, bb.width, bb.height)
    ctx.restore()
  }

  private static applyStrokeGlow(ctx: CanvasRenderingContext2D, fx: StrokeGlowFX, shape: BaseShape): void {
    ctx.save()
    ctx.shadowColor = fx.color
    ctx.shadowBlur = fx.blur
    ctx.stroke()
    ctx.restore()
  }

  private static applyColorOverlay(ctx: CanvasRenderingContext2D, fx: ColorOverlayFX, shape: BaseShape): void {
    ctx.save()
    const bb = shape.getBoundingBox()
    ctx.fillStyle = fx.color
    ctx.globalAlpha = fx.opacity
    ctx.fillRect(bb.x, bb.y, bb.width, bb.height)
    ctx.restore()
  }

  private static applyBlur(ctx: CanvasRenderingContext2D, fx: BlurFX, shape: BaseShape): void {
    ctx.filter = `blur(${fx.radius}px)`
  }
}
