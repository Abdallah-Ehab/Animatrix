import { BaseAnimation } from '../animations/BaseAnimation'

export class AnimationSystem {
  animations: BaseAnimation[]

  constructor(animations: BaseAnimation[] = []) {
    this.animations = animations
  }

  addAnimation(anim: BaseAnimation): void {
    this.animations.push(anim)
  }

  removeAnimation(id: string): void {
    this.animations = this.animations.filter(a => a.id !== id)
  }

  applyAll(shapeMap: Map<string, import('../shapes/BaseShape').BaseShape>, frame: number): void {
    for (const anim of this.animations) {
      if (frame < anim.startFrame || frame > anim.endFrame) continue
      const shape = shapeMap.get(anim.targetId)
      if (!shape) continue
      anim.apply(shape, frame)
    }
  }

  getAnimationsForTarget(targetId: string): BaseAnimation[] {
    return this.animations.filter(a => a.targetId === targetId)
  }
}
