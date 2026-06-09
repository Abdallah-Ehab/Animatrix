# EXPORT_SPEC.md — Video Export Pipeline

## 1. Output Format

**Primary format: MP4 (H.264 / AAC)**

Rationale:
- Universally supported by browsers, YouTube, Instagram, TikTok, video editors (Premiere, DaVinci, Final Cut)
- Hardware-accelerated playback everywhere
- Excellent quality-to-file-size ratio

**Secondary format: WebM (VP9)**

- Offers alpha channel (transparent background export)
- Useful for compositing in After Effects / DaVinci
- Slightly larger file sizes at equivalent quality

---

## 2. Export Pipeline Architecture

```
User clicks Export
  └─► ExportEngine.start(config: ExportConfig)
        ├─► Spawn Web Worker (exportWorker.ts)
        │     ├─► Create OffscreenCanvas (config.width × config.height)
        │     ├─► Re-instantiate scene from serialized state
        │     ├─► For frame = 0 to totalFrames:
        │     │     ├─► AnimationSystem.applyAll(frame)
        │     │     ├─► RenderEngine.renderToOffscreen(frame, offscreenCtx)
        │     │     └─► captureFrame() → ImageData → Uint8Array (RGBA)
        │     └─► Pass raw frame buffer to ffmpeg.wasm
        ├─► ffmpeg.wasm encodes to MP4/WebM
        ├─► Blob URL created
        └─► Download triggered / progress events sent back to main thread
```

The Web Worker prevents any UI freeze during export, no matter how long the video is.

---

## 3. Export Configuration

```typescript
interface ExportConfig {
  format: 'mp4' | 'webm'
  width: number
  height: number
  fps: number                   // 24 | 30 | 60
  startFrame: number            // default 0
  endFrame: number              // default scene.totalFrames
  quality: 'high' | 'medium' | 'low'   // maps to CRF values
  preset: PlatformPreset | 'custom'
  backgroundColor?: string      // override for export only (e.g. transparent)
}
```

### 3.1 Quality → CRF Mapping (H.264)

| Quality | CRF | Description |
|---------|-----|-------------|
| `high` | 18 | Near-lossless, largest file |
| `medium` | 23 | Default H.264 quality |
| `low` | 28 | Smaller file, some compression artifacts |

---

## 4. Platform Presets

```typescript
const PLATFORM_PRESETS: Record<string, PlatformPreset> = {
  youtube_landscape: {
    label: 'YouTube (Landscape)',
    width: 1920, height: 1080,
    fps: 30, aspectRatio: '16:9'
  },
  youtube_shorts: {
    label: 'YouTube Shorts',
    width: 1080, height: 1920,
    fps: 60, aspectRatio: '9:16'
  },
  instagram_post: {
    label: 'Instagram Post (Square)',
    width: 1080, height: 1080,
    fps: 30, aspectRatio: '1:1'
  },
  instagram_reel: {
    label: 'Instagram Reels',
    width: 1080, height: 1920,
    fps: 30, aspectRatio: '9:16'
  },
  tiktok: {
    label: 'TikTok',
    width: 1080, height: 1920,
    fps: 60, aspectRatio: '9:16'
  },
  twitter_landscape: {
    label: 'Twitter / X (Landscape)',
    width: 1280, height: 720,
    fps: 30, aspectRatio: '16:9'
  },
  presentation: {
    label: 'Presentation (4K)',
    width: 3840, height: 2160,
    fps: 60, aspectRatio: '16:9'
  },
  custom: {
    label: 'Custom',
    width: null, height: null,   // user enters
    fps: null
  }
}
```

---

## 5. Export UI (`components/ExportModal/`)

The modal contains:

1. **Preset selector** — card grid with platform icons and dimensions shown
2. **Custom size inputs** — width/height fields + aspect ratio lock toggle
3. **FPS selector** — 24 / 30 / 60 radio buttons
4. **Quality selector** — High / Medium / Low with file size estimate
5. **Format selector** — MP4 / WebM (with alpha note for WebM)
6. **Frame range** — start/end frame fields (default: full scene)
7. **Export button** — triggers export, shows progress bar
8. **Progress bar** — `X of N frames rendered (Z%)`
9. **Download button** — appears when complete

---

## 6. Scene Serialization for Export

The export worker receives a **serialized snapshot** of the scene state (JSON), not live React/Zustand state. This ensures the worker is fully isolated.

```typescript
interface SerializedScene {
  shapes: object[]       // each shape's serialize() output
  animations: object[]
  background: Background
  totalFrames: number
  fps: number
}
```

The worker deserializes using each class's `static deserialize()` method.

---

## 7. ffmpeg.wasm Integration

```typescript
// In exportWorker.ts
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

const ffmpeg = createFFmpeg({ log: false })
await ffmpeg.load()

// Write each frame as a PNG
for (let i = 0; i < frames.length; i++) {
  ffmpeg.FS('writeFile', `frame${String(i).padStart(6,'0')}.png`, frames[i])
}

// Encode
await ffmpeg.run(
  '-framerate', String(fps),
  '-i', 'frame%06d.png',
  '-c:v', 'libx264',
  '-crf', String(crfValue),
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',   // web-optimized MP4
  'output.mp4'
)

const data = ffmpeg.FS('readFile', 'output.mp4')
// Post back to main thread as ArrayBuffer
```
