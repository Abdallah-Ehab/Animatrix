# CHARTS_SPEC.md — Graphing & Chart Engine

## 1. Design Philosophy

Charts in Animatrix Studio are **visual-first, not data-first**. The engine does enough math to be correct, but every pixel is customizable. Charts are built on top of the same shape primitives — axes are `LineShape`s, bars are `RectShape`s, curves are `CurveShape`s — so all FX, custom styles, and animations work on charts automatically.

---

## 2. Shared Coordinate System

All charts share a `ChartAxis` object that defines the mapping from data-space to canvas-space.

```typescript
class ChartAxis {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  width: number           // canvas pixels
  height: number          // canvas pixels
  originX: number         // canvas x of (0,0)
  originY: number         // canvas y of (0,0)

  /** Map a data point to canvas coordinates */
  toCanvas(dataX: number, dataY: number): Point

  /** Map canvas coords back to data space */
  toData(canvasX: number, canvasY: number): Point
}
```

### 2.1 Shared Axis (Multi-Series)

When a user adds multiple chart types to the same chart (e.g. bar + curve), they all reference the **same `ChartAxis` instance**. This guarantees perfect alignment with zero manual work.

---

## 3. Abstract Base: `BaseChart`

```typescript
abstract class BaseChart extends BaseShape {
  axis: ChartAxis
  series: ChartSeries[]       // multiple series on one axis
  axisStyle: AxisStyle        // color, stroke width, tick style, label font
  customAxisStyle?: CustomStyle  // user-drawn axis replaces default lines

  addSeries(series: ChartSeries): void
  removeSeries(id: string): void
  abstract drawSeries(ctx: CanvasRenderingContext2D, series: ChartSeries): void
}
```

---

## 4. Chart Series Types

Each series is a `ChartSeries` object that holds data + a reference to its visual shape type.

```typescript
interface ChartSeries {
  id: string
  type: 'bar' | 'line' | 'curve' | 'scatter' | 'area'
  data: DataPoint[]              // [{x, y}] or generated from equation
  equation?: string              // e.g. "sin(x) * x^2"  (parsed by mathjs)
  xSampleCount?: number          // how many x points to sample when using equation
  color: string
  label?: string
  drawProgress: number           // 0–1, enables DrawLine animation on line/curve series
  customBarStyle?: CustomStyle   // user-drawn bar shape
  highlightedIndices?: number[]  // for bar highlighting animation
}
```

### 4.1 Equation Evaluation

When `equation` is set, the engine evaluates it using `mathjs`:

```typescript
// src/utils/mathUtils.ts
function sampleEquation(
  equation: string,
  xMin: number,
  xMax: number,
  sampleCount: number
): DataPoint[] {
  const scope = {}
  return Array.from({ length: sampleCount }, (_, i) => {
    const x = xMin + (i / (sampleCount - 1)) * (xMax - xMin)
    scope['x'] = x
    const y = math.evaluate(equation, scope)
    return { x, y }
  })
}
```

---

## 5. Concrete Chart Types

### 5.1 `BarChart`

- Each data point becomes a `RectShape` (or `customBarStyle` stamp).
- Bar height = `axis.toCanvas(x, y).y` mapped from `yMin` to `yMax`.
- Bars can have gap, border radius, fill color per bar or uniform.
- **Highlight:** per-bar color override stored in `series.highlightedIndices`.

### 5.2 `LineChart`

- Data points connected by straight `LineShape` segments (polyline).
- `drawProgress` controls how much of the polyline is visible (enables auto-draw animation).
- Trail dot (animated highlight at tip) supported via `TrailAnimation`.

### 5.3 `CurveChart`

- Like `LineChart` but data is smoothed through a Catmull-Rom or Bezier spline.
- Same `drawProgress` animation contract — abstraction inherited from `LineShape`.
- User can toggle between `'catmullrom'` and `'bezier'` interpolation.

### 5.4 `ScatterChart`

- Each point is a `CircleShape` (or custom shape).
- No line connecting points.

### 5.5 `AreaChart`

- Like `LineChart` but the region under the curve is filled.
- Fill opacity is separately configurable.

---

## 6. Multi-Series on One Axis

```typescript
// Example: bar chart + curve on the same axis
const chart = ChartFactory.createChart('combo', {
  axis: { xMin: 0, xMax: 10, yMin: 0, yMax: 100, width: 600, height: 400 }
})

chart.addSeries({
  type: 'bar',
  data: [{ x: 1, y: 40 }, { x: 2, y: 70 }, ...],
  color: '#4F8EF7'
})

chart.addSeries({
  type: 'curve',
  equation: '10 * sin(x) + 50',
  xSampleCount: 200,
  color: '#F7A24F'
})
```

Both series reference `chart.axis`, so they are automatically aligned.

---

## 7. Axis Customization

| Property | Type | Description |
|----------|------|-------------|
| `showXAxis` | boolean | |
| `showYAxis` | boolean | |
| `showGrid` | boolean | |
| `gridColor` | string | |
| `tickInterval` | `{ x: number, y: number }` | |
| `labelFormatter` | `(val: number) => string` | custom tick label |
| `axisColor` | string | |
| `arrowHeads` | boolean | put arrows at axis ends |
| `customXAxisStyle?` | `CustomStyle` | user-drawn x-axis line |
| `customYAxisStyle?` | `CustomStyle` | user-drawn y-axis line |

---

## 8. Chart Factory

```typescript
class ChartFactory {
  static createChart(type: ChartType, options: ChartOptions): BaseChart
}
// ChartType: 'bar' | 'line' | 'curve' | 'scatter' | 'area' | 'combo'
```

For `'combo'`, the factory creates a `ComboChart` that holds a `ChartAxis` and accepts mixed series.
