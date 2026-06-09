import { AnimationSystem } from '../animations/AnimationSystem'
import { RenderEngine } from './RenderEngine'

export class Timeline {
  currentFrame: number
  totalFrames: number
  fps: number
  isPlaying: boolean
  private animationSystem: AnimationSystem
  private renderEngine: RenderEngine
  private rafId: number | null
  private onFrameChange?: (frame: number) => void

  constructor(options: { fps?: number; totalFrames?: number; renderEngine: RenderEngine; animationSystem: AnimationSystem }) {
    this.currentFrame = 0
    this.totalFrames = options.totalFrames ?? 150
    this.fps = options.fps ?? 30
    this.isPlaying = false
    this.renderEngine = options.renderEngine
    this.animationSystem = options.animationSystem
    this.rafId = null
  }

  setFrameChangeCallback(cb: (frame: number) => void): void {
    this.onFrameChange = cb
  }

  play(): void {
    if (this.isPlaying) return
    this.isPlaying = true
    this.tick()
  }

  pause(): void {
    this.isPlaying = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  stop(): void {
    this.pause()
    this.goToFrame(0)
  }

  goToFrame(frame: number): void {
    this.currentFrame = Math.max(0, Math.min(frame, this.totalFrames))
    this.renderEngine.render(this.currentFrame)
    this.onFrameChange?.(this.currentFrame)
  }

  private tick(): void {
    if (!this.isPlaying) return
    this.renderEngine.render(this.currentFrame)
    this.onFrameChange?.(this.currentFrame)
    this.currentFrame++
    if (this.currentFrame > this.totalFrames) {
      this.currentFrame = 0
    }
    const interval = 1000 / this.fps
    this.rafId = window.setTimeout(() => {
      this.rafId = requestAnimationFrame(() => this.tick())
    }, interval)
  }

  setFps(fps: number): void {
    this.fps = fps
  }

  setTotalFrames(total: number): void {
    this.totalFrames = total
  }
}
