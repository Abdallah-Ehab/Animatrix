# FX_SPEC.md — Visual Effects, Colors & Backgrounds

## 1. FX Pipeline (Decorator Pattern)

Each shape has an ordered `fx: FXConfig[]` array. The `FXPipeline` wraps the shape's draw call:

```typescript
class FXPipeline {
  /**
   * Draws the shape with all FX applied in order.
   * Pre-draw FX (shadows, outer glow) are applied first.
   * Post-draw FX (inner glow, overlay) are applied after.
   */
  static draw(shape: BaseShape, ctx: CanvasRenderingContext2D): void {
    ctx.save()
    this.applyPreFX(shape, ctx)          // outer glow, drop shadow
    if (shape.customStyle) {
      shape.customStyle.render(ctx, shape.getBoundingBox())
    } else {
      shape.draw(ctx)                    // normal geometric draw
    }
    this.applyPostFX(shape, ctx)         // inner glow, color overlay
    ctx.restore()
  }
}
```

---

## 2. Available FX

### 2.1 Outer Glow

Simulated by drawing the shape multiple times at increasing blur levels behind the main shape.

```typescript
interface OuterGlowFX {
  type: 'outerGlow'
  color: string         // glow color
  blur: number          // px — Canvas shadowBlur
  spread: number        // px — extra size beyond shape edge
  opacity: number       // 0–1
}
```

**Implementation:** Uses `ctx.shadowBlur` + `ctx.shadowColor` trick, drawing the shape with only the shadow visible by compositing.

### 2.2 Inner Glow

Drawn on top of the shape using a radial gradient clipped to the shape's path.

```typescript
interface InnerGlowFX {
  type: 'innerGlow'
  color: string
  blur: number
  opacity: number
}
```

### 2.3 Drop Shadow

```typescript
interface DropShadowFX {
  type: 'dropShadow'
  color: string
  offsetX: number
  offsetY: number
  blur: number
  opacity: number
}
```

### 2.4 Stroke Glow

Only the stroke (outline) of the shape glows. Useful for neon-line effects on axes, chart lines, etc.

```typescript
interface StrokeGlowFX {
  type: 'strokeGlow'
  color: string
  blur: number
  layers: number     // how many glow passes — more = brighter
}
```

### 2.5 Color Overlay

Tints the entire shape with a semi-transparent color.

```typescript
interface ColorOverlayFX {
  type: 'colorOverlay'
  color: string
  opacity: number   // 0–1
}
```

### 2.6 Blur

Gaussian blur on the shape itself. Useful for background/depth-of-field effects.

```typescript
interface BlurFX {
  type: 'blur'
  radius: number
}
// Implementation: draw shape to OffscreenCanvas, apply filter: blur(), drawImage back
```

---

## 3. Color System

### 3.1 Shape Colors

Every shape has:
- `fillColor: string` — CSS color, `'none'`, or `'transparent'`
- `strokeColor: string`
- `strokeWidth: number`
- `opacity: number` — 0–1, applied to the entire shape including FX

### 3.2 Color Picker Component

The color picker supports:
- Hex input
- HSL sliders
- Opacity slider
- A **palette** of recently used colors (persisted in localStorage)
- A **theme palette** — user can define a project color theme (6–8 colors) used across all shapes

### 3.3 Gradient Fill

Shapes can use a `GradientFill` instead of a flat color:

```typescript
interface GradientFill {
  type: 'linear' | 'radial'
  stops: { offset: number; color: string }[]
  angle?: number    // for linear
}
```

---

## 4. Background System

The viewport background is separate from all shapes and is drawn first every frame.

```typescript
interface Background {
  type: 'solid' | 'gradient' | 'image' | 'grid' | 'dots'
  // solid
  color?: string
  // gradient
  gradient?: GradientFill
  // image
  imageUrl?: string
  imageOpacity?: number
  imageBlur?: number
  // grid (graph-paper style)
  gridColor?: string
  gridSize?: number
  // dots (Keynote-style dot grid)
  dotColor?: string
  dotSpacing?: number
  dotRadius?: number
}
```

**Common presets available in UI:**
- Black (3B1B style)
- Dark navy
- White
- Transparent (for export with alpha — WebM only)
- Graph paper
- Dot grid
- Custom image

---

## 5. Shape Sketch / Hand-drawn Theme

When the user sets a `customStyle` on a shape (via the brush tool), the FX pipeline uses the brush strokes for rendering. This effectively replaces the geometric look with a hand-drawn / sketch look — matching the 3B1B aesthetic when desired.

The sketch style can be toggled on/off per shape without losing the original geometry.
