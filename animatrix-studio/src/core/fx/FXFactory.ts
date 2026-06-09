import type { FXConfig } from './FXPipeline'
import { FXPipeline } from './FXPipeline'
import type { FXType } from '../../constants'

export class FXFactory {
  static createFX(type: FXType | string, options: Record<string, any>): FXConfig {
    switch (type) {
      case 'outerGlow':
        return { type: 'outerGlow', color: options.color ?? '#4F8EF7', blur: options.blur ?? 20, spread: (options as any).spread ?? 5, opacity: options.opacity ?? 0.5 }
      case 'innerGlow':
        return { type: 'innerGlow', color: options.color ?? '#4F8EF7', blur: options.blur ?? 15, opacity: options.opacity ?? 0.4 }
      case 'dropShadow':
        return { type: 'dropShadow', color: options.color ?? 'rgba(0,0,0,0.5)', offsetX: (options as any).offsetX ?? 5, offsetY: (options as any).offsetY ?? 5, blur: options.blur ?? 10, opacity: options.opacity ?? 0.6 }
      case 'strokeGlow':
        return { type: 'strokeGlow', color: options.color ?? '#4F8EF7', blur: options.blur ?? 8, layers: (options as any).layers ?? 3 }
      case 'colorOverlay':
        return { type: 'colorOverlay', color: options.color ?? '#ffffff', opacity: options.opacity ?? 0.3 }
      case 'blur':
        return { type: 'blur', radius: (options as any).radius ?? 4 }
      default:
        throw new Error(`Unknown FX type: ${type}`)
    }
  }
}
