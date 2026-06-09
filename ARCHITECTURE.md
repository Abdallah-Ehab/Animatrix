# ARCHITECTURE.md — Animatrix Studio

## 1. Technology Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| **UI Framework** | React 18 + TypeScript | Component model maps cleanly to the OOP shape hierarchy; TS enforces interfaces |
| **Rendering** | HTML5 Canvas 2D (primary) + OffscreenCanvas for export | Direct pixel control, no DOM overhead during animation playback |
| **State management** | Zustand (lightweight, no boilerplate) | Simple slice-per-domain; easy to subscribe from Canvas render loop |
| **Charts / Math** | Custom engine (no Chart.js dependency) | Full visual control required; Chart.js fights the custom-style system |
| **Expression parser** | `mathjs` | Safe, sandboxed equation evaluation (`y = sin(x) * x^2`) |
| **Video export** | `@ffmpeg/ffmpeg` (WASM) → MP4 (H.264) | Runs in-browser, no server; MP4/H.264 is universally compatible |
| **Brush / Path** | Canvas Path2D API | Smooth curves, hit-testing, replayable strokes |
| **Build tool** | Vite | Fast HMR; easy WASM integration |
| **Testing** | Vitest + Testing Library | Co-located with Vite |

---

## 2. Repository Structure

```
animatrix-studio/
├── public/
│   └── ffmpeg/                  # WASM binaries (copied at build)
├── src/
│   ├── constants/               # COLOR_DEFAULTS, FPS, PLATFORM_PRESETS, etc.
│   ├── core/
│   │   ├── engine/
│   │   │   ├── RenderEngine.ts      # Master Canvas render loop
│   │   │   ├── Timeline.ts          # Frame clock, playback control
│   │   │   └── ExportEngine.ts      # OffscreenCanvas → frames → ffmpeg
│   │   ├── shapes/
│   │   │   ├── BaseShape.ts         # Abstract base — all shapes extend this
│   │   │   ├── primitives/          # Circle, Rect, Line, Curve, Arrow, Text
│   │   │   ├── cs/                  # Grid, Cell, ArrayBar, Stack, Tree, Graph nodes
│   │   │   └── ShapeFactory.ts      # Factory pattern — createShape(type, opts)
│   │   ├── charts/
│   │   │   ├── BaseChart.ts
│   │   │   ├── BarChart.ts
│   │   │   ├── LineChart.ts
│   │   │   ├── CurveChart.ts
│   │   │   ├── ChartAxis.ts
│   │   │   └── ChartFactory.ts
│   │   ├── animations/
│   │   │   ├── BaseAnimation.ts     # Abstract — start/end frame, easing, apply()
│   │   │   ├── presets/
│   │   │   │   ├── DrawLineAnimation.ts
│   │   │   │   ├── FadeAnimation.ts
│   │   │   │   ├── GrowBarAnimation.ts
│   │   │   │   ├── HighlightCellAnimation.ts
│   │   │   │   ├── StaggerAnimation.ts  # Wraps any animation with per-child offset
│   │   │   │   └── TrailAnimation.ts    # Animated highlight dot at line tip
│   │   │   └── AnimationFactory.ts
│   │   ├── brush/
│   │   │   ├── BrushTool.ts         # Captures pointer events → StrokeData
│   │   │   ├── StrokeRenderer.ts    # Renders StrokeData onto canvas
│   │   │   └── CustomStyle.ts       # Maps a user stroke as a style for a shape type
│   │   └── fx/
│   │       ├── FXPipeline.ts        # Decorator chain applied per shape
│   │       ├── GlowFX.ts
│   │       ├── ShadowFX.ts
│   │       └── FXFactory.ts
│   ├── store/
│   │   ├── sceneStore.ts        # Shapes, charts, layers
│   │   ├── timelineStore.ts     # Animations, current frame, playback state
│   │   ├── uiStore.ts           # Active tool, selected shape, panel visibility
│   │   └── exportStore.ts       # Export settings, progress
│   ├── components/
│   │   ├── Viewport/            # Main canvas area
│   │   ├── Timeline/            # Frame ruler, keyframe tracks
│   │   ├── Toolbar/             # Left tool palette
│   │   ├── Inspector/           # Right property panel
│   │   ├── ShapeLibrary/        # Shape/chart picker panel
│   │   ├── BrushPanel/
│   │   ├── ExportModal/
│   │   └── common/              # Button, Slider, ColorPicker, etc.
│   ├── hooks/
│   │   ├── useRenderLoop.ts
│   │   ├── useTimeline.ts
│   │   └── useExport.ts
│   └── utils/
│       ├── mathUtils.ts         # Equation evaluation wrappers
│       ├── colorUtils.ts
│       ├── bezierUtils.ts
│       └── easing.ts            # Easing functions (easeInOut, spring, etc.)
├── tests/
└── vite.config.ts
```

---

## 3. Core Design Patterns Used

### 3.1 Factory
`ShapeFactory.createShape(type: ShapeType, options)` and `ChartFactory.createChart(type, options)` decouple consumers from concrete classes.

### 3.2 Observer (via Zustand subscriptions)
`Timeline` publishes `currentFrame`. `RenderEngine` subscribes and redraws. `Inspector` subscribes to `selectedShape` and re-renders properties.

### 3.3 Command (Undo/Redo)
Every user action (add shape, move, change color, add keyframe) is a `Command` object with `execute()` / `undo()`. A `CommandHistory` stack is maintained in `sceneStore`.

### 3.4 Strategy
Each `BaseAnimation` subclass is a strategy — it implements `apply(shape, frame)`. The `Timeline` doesn't know which strategy it calls; it just iterates active animations.

### 3.5 Composite
Shapes can be grouped (`GroupShape extends BaseShape`). An animation applied to a group propagates to all children. A chart is a composite of `ChartAxis` + multiple series shapes.

### 3.6 Decorator
`FXPipeline` wraps shape draw calls with an ordered chain of FX decorators (e.g. `GlowFX → ShadowFX → BaseShapeDraw`).

---

## 4. Rendering Pipeline (per frame)

```
Timeline.tick(frame)
  └─► RenderEngine.render(frame)
        ├─► ctx.clearRect / drawBackground
        ├─► for each Layer (sorted by z-index):
        │     for each Shape in layer:
        │       ├─► AnimationSystem.applyAll(shape, frame)   // mutates shape.animatedState
        │       └─► FXPipeline.draw(shape, ctx)
        └─► (export mode) ExportEngine.captureFrame(ctx)
```

---

## 5. Data Model Relationships

```
Scene
  ├── layers[]: Layer
  │     └── shapes[]: BaseShape (polymorphic)
  ├── charts[]: BaseChart
  │     ├── axes: ChartAxis[]
  │     └── series[]: ChartSeries (each series holds a BaseShape for visual style)
  └── animations[]: BaseAnimation[]
        └── targetId: string  (UUID of shape or chart series)
```

---

## 6. Key Non-Negotiables

- **FPS is configurable** (24 / 30 / 60). All animation durations are in **frames**, not milliseconds, so exports are deterministic.
- **OffscreenCanvas** is used in a Web Worker for export so the UI never freezes.
- **No global mutable state** outside Zustand stores.
- **Every shape stores its own `baseState`** (position, color, etc.) and its `animatedState` is a transient copy mutated each frame — the base is never overwritten during playback.
