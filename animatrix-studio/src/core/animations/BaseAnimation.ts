import { BaseShape } from '../shapes/BaseShape'
import type { EasingFn } from '../../utils/easing'
import { EASING_FUNCTIONS } from '../../utils/easing'

export abstract class BaseAnimation {
  id: string
  targetId: string
  startFrame: number
  endFrame: number
  easing: string

  constructor(options: { id: string; targetId: string; startFrame: number; endFrame: number; easing?: string }) {
    this.id = options.id
    this.targetId = options.targetId
    this.startFrame = options.startFrame
    this.endFrame = options.endFrame
    this.easing = options.easing ?? 'linear'
  }

  protected getProgress(frame: number): number {
    if (frame <= this.startFrame) return 0
    if (frame >= this.endFrame) return 1
    const t = (frame - this.startFrame) / (this.endFrame - this.startFrame)
    const easingFn: EasingFn = EASING_FUNCTIONS[this.easing] ?? EASING_FUNCTIONS.linear
    return easingFn(t)
  }

  abstract apply(shape: BaseShape, frame: number): void

  abstract clone(): BaseAnimation

  abstract serialize(): object
}

export class FadeAnimation extends BaseAnimation {
  fromOpacity: number
  toOpacity: number

  constructor(options: { id: string; targetId: string; startFrame: number; endFrame: number; easing?: string; fromOpacity?: number; toOpacity?: number }) {
    super(options)
    this.fromOpacity = options.fromOpacity ?? 0
    this.toOpacity = options.toOpacity ?? 1
  }

  apply(shape: BaseShape, frame: number): void {
    const progress = this.getProgress(frame)
    shape.animatedState.opacity = this.fromOpacity + (this.toOpacity - this.fromOpacity) * progress
  }

  clone(): FadeAnimation {
    return new FadeAnimation({ ...this })
  }

  serialize(): object {
    return { type: 'fade', ...this }
  }
}

export class DrawLineAnimation extends BaseAnimation {
  constructor(options: { id: string; targetId: string; startFrame: number; endFrame: number; easing?: string }) {
    super(options)
  }

  apply(shape: BaseShape, frame: number): void {
    const progress = this.getProgress(frame)
    ;(shape.animatedState as any).drawProgress = progress
  }

  clone(): DrawLineAnimation {
    return new DrawLineAnimation({ ...this })
  }

  serialize(): object {
    return { type: 'drawLine', ...this }
  }
}

export class GrowBarAnimation extends BaseAnimation {
  fromScale: number
  toScale: number

  constructor(options: { id: string; targetId: string; startFrame: number; endFrame: number; easing?: string; fromScale?: number; toScale?: number }) {
    super(options)
    this.fromScale = options.fromScale ?? 0
    this.toScale = options.toScale ?? 1
  }

  apply(shape: BaseShape, frame: number): void {
    const progress = this.getProgress(frame)
    const scaleY = this.fromScale + (this.toScale - this.fromScale) * progress
    shape.animatedState = { ...shape.animatedState, scaleY }
  }

  clone(): GrowBarAnimation {
    return new GrowBarAnimation({ ...this })
  }

  serialize(): object {
    return { type: 'growBar', ...this }
  }
}

export class HighlightCellAnimation extends BaseAnimation {
  highlightColor: string
  row: number
  col: number

  constructor(options: { id: string; targetId: string; startFrame: number; endFrame: number; easing?: string; highlightColor?: string; row: number; col: number }) {
    super(options)
    this.highlightColor = options.highlightColor ?? '#F7A24F'
    this.row = options.row
    this.col = options.col
  }

  apply(shape: BaseShape, frame: number): void {
    const progress = this.getProgress(frame)
    if (progress > 0 && 'highlightedCells' in shape) {
      const grid = shape as any
      const existing = (grid.highlightedCells ?? []).filter(
        (h: any) => !(h.row === this.row && h.col === this.col)
      )
      existing.push({ row: this.row, col: this.col, color: this.highlightColor })
      ;(shape.animatedState as any).highlightedCells = existing
    }
  }

  clone(): HighlightCellAnimation {
    return new HighlightCellAnimation({ ...this })
  }

  serialize(): object {
    return { type: 'highlightCell', ...this }
  }
}

export class StaggerAnimation extends BaseAnimation {
  childAnimations: BaseAnimation[]
  staggerOffset: number

  constructor(options: { id: string; targetId: string; startFrame: number; endFrame: number; easing?: string; childAnimations: BaseAnimation[]; staggerOffset?: number }) {
    super(options)
    this.childAnimations = options.childAnimations
    this.staggerOffset = options.staggerOffset ?? 5
  }

  apply(shape: BaseShape, frame: number): void {
    for (const anim of this.childAnimations) {
      anim.apply(shape, frame)
    }
  }

  clone(): StaggerAnimation {
    return new StaggerAnimation({
      ...this,
      childAnimations: this.childAnimations.map(a => a.clone()),
    })
  }

  serialize(): object {
    return { type: 'stagger', ...this, childAnimations: this.childAnimations.map(a => a.serialize()) }
  }
}

export class TrailAnimation extends BaseAnimation {
  dotRadius: number
  dotColor: string

  constructor(options: { id: string; targetId: string; startFrame: number; endFrame: number; easing?: string; dotRadius?: number; dotColor?: string }) {
    super(options)
    this.dotRadius = options.dotRadius ?? 6
    this.dotColor = options.dotColor ?? '#ffffff'
  }

  apply(shape: BaseShape, frame: number): void {
    const progress = this.getProgress(frame);
    (shape.animatedState as any).trailProgress = progress;
    (shape.animatedState as any).trailColor = this.dotColor;
    (shape.animatedState as any).trailRadius = this.dotRadius
  }

  clone(): TrailAnimation {
    return new TrailAnimation({ ...this })
  }

  serialize(): object {
    return { type: 'trail', ...this }
  }
}
