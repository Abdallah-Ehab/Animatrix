# SHAPES_SPEC.md — All Shape Types

## 1. Abstract Base: `BaseShape`

Every shape in the system extends `BaseShape`. It defines the contract all shapes must fulfill.

```typescript
abstract class BaseShape {
  id: string                  // UUID
  name: string                // user-facing label
  layer: string               // layer UUID
  zIndex: number

  // Transform
  x: number
  y: number
  rotation: number            // degrees
  scaleX: number
  scaleY: number

  // Style
  fillColor: string           // CSS color or 'none'
  strokeColor: string
  strokeWidth: number
  opacity: number             // 0–1
  customStyle?: CustomStyle   // optional brush-drawn style override

  // FX
  fx: FXConfig[]              // ordered list of applied effects

  // Animated state (transient, rebuilt each frame)
  animatedState: Partial<BaseShape>

  abstract draw(ctx: CanvasRenderingContext2D): void
  abstract getBoundingBox(): BoundingBox
  abstract clone(): BaseShape
  abstract serialize(): object
  static deserialize(data: object): BaseShape  // implemented per subclass
}
```

---

## 2. Primitive Shapes (`src/core/shapes/primitives/`)

### 2.1 `RectShape`
| Property | Type | Description |
|----------|------|-------------|
| `width` | number | |
| `height` | number | |
| `cornerRadius` | number | rounded corners |

### 2.2 `CircleShape`
| Property | Type | Description |
|----------|------|-------------|
| `radius` | number | |
| `startAngle` | number | degrees — allows arcs |
| `endAngle` | number | degrees |

### 2.3 `EllipseShape`
| Property | Type | Description |
|----------|------|-------------|
| `radiusX` | number | |
| `radiusY` | number | |

### 2.4 `LineShape`
| Property | Type | Description |
|----------|------|-------------|
| `x2` | number | end point |
| `y2` | number | end point |
| `drawProgress` | number | 0–1, used by DrawLine animation |
| `capStyle` | `'none'\|'arrow'\|'dot'` | |

`LineShape` is the **universal primitive** — `CurveShape`, `ChartLine`, and `ChartCurve` all extend it or delegate to it. This is how the same `DrawLineAnimation` works across all of them.

### 2.5 `CurveShape` (extends `LineShape`)
| Property | Type | Description |
|----------|------|-------------|
| `cp1x`, `cp1y` | number | control point 1 |
| `cp2x`, `cp2y` | number | control point 2 |
| `points` | `Point[]` | for polyline/spline mode |

### 2.6 `ArrowShape` (extends `LineShape`)
| Property | Type | Description |
|----------|------|-------------|
| `headSize` | number | |
| `headStyle` | `'filled'\|'outline'\|'double'` | |

### 2.7 `TextShape`
| Property | Type | Description |
|----------|------|-------------|
| `text` | string | supports multi-line with `\n` |
| `fontFamily` | string | |
| `fontSize` | number | |
| `fontWeight` | string | |
| `align` | `'left'\|'center'\|'right'` | |
| `textColor` | string | |

### 2.8 `PolygonShape`
| Property | Type | Description |
|----------|------|-------------|
| `sides` | number | 3 = triangle, 6 = hexagon, etc. |
| `radius` | number | circumscribed radius |

### 2.9 `GroupShape` (Composite)
| Property | Type | Description |
|----------|------|-------------|
| `children` | `BaseShape[]` | |

`draw()` iterates children. Transforms applied to the group are inherited.

---

## 3. CS / Science Shapes (`src/core/shapes/cs/`)

These are higher-level compound shapes built from primitives but exposed as first-class shape types.

### 3.1 `GridShape` — visualize 2D arrays / matrices

```
┌───┬───┬───┐
│ 0 │ 1 │ 2 │
├───┼───┼───┤
│ 3 │ 4 │ 5 │
└───┴───┴───┘
```

| Property | Type | Description |
|----------|------|-------------|
| `rows` | number | |
| `cols` | number | |
| `cellWidth` | number | |
| `cellHeight` | number | |
| `cellPadding` | number | |
| `cellStyle` | `CellStyle` | shared style for all cells |
| `values` | `(string\|number)[][]` | optional data to display inside cells |
| `highlightedCells` | `{row,col,color}[]` | driven by animation |
| `customCellStyle?` | `CustomStyle` | user-drawn cell shape used instead of rect |

**Implementation note:** `GridShape.draw()` tiles the `customCellStyle` path (if set) using a stamp approach — the user draws one cell, it is rasterized to an `OffscreenCanvas`, then `drawImage()` is used to tile it.

### 3.2 `ArrayBarShape` — 1D array with value bars

Like a grid but cells have variable heights representing values.

| Property | Type | Description |
|----------|------|-------------|
| `values` | `number[]` | |
| `maxValue` | number | auto or manual |
| `barWidth` | number | |
| `gap` | number | |
| `showIndices` | boolean | |
| `showValues` | boolean | |

### 3.3 `StackShape` — call stack / memory stack visualizer

Vertical stack of labeled rectangles that can be pushed/popped via animation.

### 3.4 `LinkedListShape`

Horizontal or vertical chain of `NodeShape` connected by `ArrowShape`. Nodes are auto-laid-out.

| Property | Type | Description |
|----------|------|-------------|
| `nodes` | `{label: string, value: any}[]` | |
| `direction` | `'horizontal'\|'vertical'` | |
| `showNullTerminator` | boolean | |

### 3.5 `BinaryTreeShape`

Auto-layout binary tree. Nodes are circles with values; edges are lines.

| Property | Type | Description |
|----------|------|-------------|
| `root` | `TreeNode` | recursive structure |
| `levelGap` | number | |
| `nodeRadius` | number | |
| `highlightedNodes` | `string[]` | node ids |

### 3.6 `GraphShape` (nodes + edges, not chart)

For graph-theory visualizations.

| Property | Type | Description |
|----------|------|-------------|
| `nodes` | `{id, label, x, y}[]` | |
| `edges` | `{from, to, weight?, directed?}[]` | |
| `nodeRadius` | number | |

### 3.7 `CoordinatePlaneShape`

A standalone x/y axis pair (without chart data) for mathematical diagrams.

| Property | Type | Description |
|----------|------|-------------|
| `xMin`, `xMax` | number | |
| `yMin`, `yMax` | number | |
| `tickInterval` | number | |
| `showGrid` | boolean | |
| `gridColor` | string | |
| `labelFont` | string | |

---

## 4. Shape Factory

```typescript
// src/core/shapes/ShapeFactory.ts
class ShapeFactory {
  /**
   * Creates a shape instance from a type identifier and options object.
   * Throws if type is unknown.
   */
  static createShape(type: ShapeType, options: Partial<BaseShape>): BaseShape

  /**
   * Registers a custom shape class. Allows future extensibility.
   */
  static register(type: string, ctor: typeof BaseShape): void
}
```

`ShapeType` is a string union of all built-in type keys: `'rect' | 'circle' | 'line' | 'curve' | 'arrow' | 'text' | 'polygon' | 'group' | 'grid' | 'arrayBar' | 'stack' | 'linkedList' | 'binaryTree' | 'graph' | 'coordinatePlane'`.
