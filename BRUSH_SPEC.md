# BRUSH_SPEC.md — Freehand Brush Tool & Custom Style System

## 1. Overview

The brush tool serves two purposes:

1. **Free annotation / drawing** — the user draws on the canvas and the strokes are persistent `BrushStroke` shapes.
2. **Custom style source** — the user draws a shape (e.g. a hand-drawn rectangle, a sketchy line) and assigns it as the visual style for a primitive or CS shape type. After that, every shape of that type renders using the drawn style.

---

## 2. Brush Tool (`BrushTool.ts`)

### 2.1 Brush Modes

| Mode | Description |
|------|-------------|
| `pen` | Smooth pressure-sensitive stroke using Bezier smoothing |
| `marker` | Flat, opaque, wide stroke |
| `chalk` | Textured stroke with canvas noise |
| `ink` | Tapered stroke — thin at start/end, thick in middle |
| `eraser` | Erases underlying strokes |

### 2.2 Stroke Data Model

```typescript
interface StrokePoint {
  x: number
  y: number
  pressure: number    // 0–1 (from PointerEvent.pressure or simulated)
  timestamp: number   // ms, used for velocity-based width
}

class BrushStroke extends BaseShape {
  mode: BrushMode
  points: StrokePoint[]
  brushSize: number
  color: string
  opacity: number
  smoothing: number   // 0–1, Chaikin or Bezier smoothing passes

  draw(ctx: CanvasRenderingContext2D): void
  // Replays the stroke using Path2D for perf
}
```

### 2.3 Smoothing Algorithm

On `pointerup`, the raw `StrokePoint[]` is passed through a Chaikin curve smoothing pass (configurable number of iterations). This gives organic, natural-looking lines.

### 2.4 Input Handling

```typescript
// In BrushTool.ts
onPointerDown(e: PointerEvent): void   // start new stroke
onPointerMove(e: PointerEvent): void   // append point, live preview
onPointerUp(e: PointerEvent): void     // finalize, smooth, add to scene
```

Pointer events are used (not mouse events) to support stylus pressure on tablets.

---

## 3. Custom Style System (`CustomStyle.ts`)

### 3.1 Concept

A `CustomStyle` is a recorded brush stroke (or set of strokes) that replaces the default geometric draw of a shape. The shape's mathematical bounds are preserved — only the visual rendering changes.

```typescript
class CustomStyle {
  id: string
  name: string
  strokes: BrushStroke[]          // the drawing the user made
  boundingBox: BoundingBox        // the box the user drew within
  targetShapeType: ShapeType      // which shape type this style is for

  /**
   * Renders the custom style scaled/transformed to fit the
   * target shape's bounding box on the main canvas.
   */
  render(ctx: CanvasRenderingContext2D, targetBox: BoundingBox): void
}
```

### 3.2 Recording a Custom Style

1. User selects a shape (e.g. a `RectShape`).
2. User clicks **"Draw Custom Style"** in the Inspector.
3. A style-recording overlay appears showing a dashed bounding box at a fixed size.
4. User draws inside the box using the brush tool.
5. On confirm, a `CustomStyle` is created and linked to that specific shape instance (or globally to the shape type).

### 3.3 Style Application

When `shape.customStyle` is set, `FXPipeline.draw()` calls `customStyle.render()` instead of `shape.draw()`. The drawn strokes are affine-transformed to fill the shape's current bounding box each frame.

### 3.4 Grid / Cell Stamping

For `GridShape` with a `customCellStyle`, the style is pre-rendered to an `OffscreenCanvas` at cell size. `GridShape.draw()` uses `ctx.drawImage()` to stamp it at each cell position. This is O(1) per cell regardless of stroke complexity.

### 3.5 Chart Bar Custom Style

For bar charts with a `customBarStyle`, the same stamp approach is used but the stamp is **stretched vertically** to match each bar's dynamic height. The user should be informed of this in the UI so they draw a bar style that tiles gracefully when stretched.

### 3.6 Chart Axis Custom Style

For `customXAxisStyle` / `customYAxisStyle`, the stroke is **stretched horizontally / vertically** to match the axis length. Same stretching caveat applies.

---

## 4. Brush Panel UI (`components/BrushPanel/`)

The brush panel exposes:
- Brush mode selector (icon buttons)
- Size slider (2–100px)
- Opacity slider
- Smoothing slider
- Color picker
- **"Save as Custom Style"** button — prompts the user to name the style and choose which shape type it applies to
- Style library — shows all saved custom styles with preview thumbnails; user can drag-assign them to shapes
