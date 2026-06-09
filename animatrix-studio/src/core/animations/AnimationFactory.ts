import { BaseAnimation, FadeAnimation, DrawLineAnimation, GrowBarAnimation, HighlightCellAnimation, StaggerAnimation, TrailAnimation } from './BaseAnimation'
import type { AnimationPreset } from '../../constants'

export class AnimationFactory {
  static createAnimation(type: AnimationPreset | string, options: any): BaseAnimation {
    switch (type) {
      case 'fade': return new FadeAnimation(options)
      case 'drawLine': return new DrawLineAnimation(options)
      case 'growBar': return new GrowBarAnimation(options)
      case 'highlightCell': return new HighlightCellAnimation(options)
      case 'stagger': return new StaggerAnimation(options)
      case 'trail': return new TrailAnimation(options)
      default: throw new Error(`Unknown animation type: ${type}`)
    }
  }
}
