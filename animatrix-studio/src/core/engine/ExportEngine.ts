import type { BaseShape } from '../shapes/BaseShape'
import type { BaseAnimation } from '../animations/BaseAnimation'

export interface ExportConfig {
  format: 'mp4' | 'webm'
  width: number
  height: number
  fps: number
  startFrame: number
  endFrame: number
  quality: 'high' | 'medium' | 'low'
  backgroundColor?: string
}

export class ExportEngine {
  private config: ExportConfig | null = null
  private onProgress?: (rendered: number, total: number) => void
  private onComplete?: (blob: Blob) => void

  configure(config: ExportConfig): void {
    this.config = config
  }

  onProgressCallback(cb: (rendered: number, total: number) => void): void {
    this.onProgress = cb
  }

  onCompleteCallback(cb: (blob: Blob) => void): void {
    this.onComplete = cb
  }

  async start(
    shapes: Map<string, BaseShape>,
    animations: BaseAnimation[],
    _background?: any
  ): Promise<void> {
    if (!this.config) throw new Error('Export config not set')
    const config = this.config
    const totalFrames = config.endFrame - config.startFrame + 1

    const frames: ImageBitmap[] = []

    for (let frame = config.startFrame; frame <= config.endFrame; frame++) {
      const canvas = document.createElement('canvas')
      canvas.width = config.width
      canvas.height = config.height
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, config.width, config.height)
      if (config.backgroundColor) {
        ctx.fillStyle = config.backgroundColor
        ctx.fillRect(0, 0, config.width, config.height)
      }

      for (const shape of shapes.values()) {
        shape.draw(ctx)
      }

      const bitmap = await createImageBitmap(canvas)
      frames.push(bitmap)
      this.onProgress?.(frame - config.startFrame + 1, totalFrames)
    }

    const blob = await this.encodeFrames(frames, config)
    this.onComplete?.(blob)
  }

  private async encodeFrames(frames: ImageBitmap[], config: ExportConfig): Promise<Blob> {
    const canvas = document.createElement('canvas')
    canvas.width = config.width
    canvas.height = config.height
    const ctx = canvas.getContext('2d')!

    const stream = canvas.captureStream(config.fps)
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: config.format === 'webm' ? 'video/webm' : 'video/mp4',
      videoBitsPerSecond: config.quality === 'high' ? 20_000_000 : config.quality === 'medium' ? 10_000_000 : 5_000_000,
    })

    return new Promise((resolve, reject) => {
      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }
      mediaRecorder.onstop = () => {
        resolve(new Blob(chunks, { type: config.format === 'webm' ? 'video/webm' : 'video/mp4' }))
      }
      mediaRecorder.onerror = reject
      mediaRecorder.start()

      let i = 0
      const writeFrame = () => {
        if (i >= frames.length) {
          mediaRecorder.stop()
          return
        }
        ctx.drawImage(frames[i], 0, 0)
        i++
        requestAnimationFrame(writeFrame)
      }
      writeFrame()
    })
  }
}
