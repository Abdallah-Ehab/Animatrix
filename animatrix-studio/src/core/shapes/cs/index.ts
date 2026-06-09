import { BaseShape, BoundingBox } from '../BaseShape'

interface CellStyle {
  fillColor: string
  strokeColor: string
  strokeWidth: number
  textColor: string
  fontSize: number
}

export class GridShape extends BaseShape {
  rows: number
  cols: number
  cellWidth: number
  cellHeight: number
  cellPadding: number
  cellStyle: CellStyle
  values: (string | number)[][]
  highlightedCells: { row: number; col: number; color: string }[]
  highlightSchedule: { row: number; col: number; color: string; startFrame: number; endFrame: number }[]

  constructor(options: Partial<GridShape> & { name: string }) {
    super(options)
    this.rows = options.rows ?? 3
    this.cols = options.cols ?? 3
    this.cellWidth = options.cellWidth ?? 80
    this.cellHeight = options.cellHeight ?? 60
    this.cellPadding = options.cellPadding ?? 2
    this.cellStyle = options.cellStyle ?? { fillColor: '#1a1a3e', strokeColor: '#4F8EF7', strokeWidth: 1, textColor: '#ffffff', fontSize: 16 }
    this.values = options.values ?? []
    this.highlightedCells = options.highlightedCells ?? []
    this.highlightSchedule = options.highlightSchedule ?? []
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const cf = (this as any)._currentFrame ?? 0
    const activeHL = this.highlightSchedule.filter(h => cf >= h.startFrame && cf <= h.endFrame)

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.x + c * (this.cellWidth + this.cellPadding)
        const y = this.y + r * (this.cellHeight + this.cellPadding)
        const highlight = this.highlightedCells.find(h => h.row === r && h.col === c)
        const schedHL = activeHL.find(h => h.row === r && h.col === c)

        ctx.fillStyle = schedHL?.color ?? highlight?.color ?? this.cellStyle.fillColor
        ctx.fillRect(x, y, this.cellWidth, this.cellHeight)

        ctx.strokeStyle = this.cellStyle.strokeColor
        ctx.lineWidth = this.cellStyle.strokeWidth
        ctx.strokeRect(x, y, this.cellWidth, this.cellHeight)

        const val = this.values[r]?.[c]
        if (val !== undefined) {
          ctx.fillStyle = this.cellStyle.textColor
          ctx.font = `${this.cellStyle.fontSize}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(String(val), x + this.cellWidth / 2, y + this.cellHeight / 2)
        }
      }
    }
  }

  clone(): GridShape {
    return new GridShape({
      ...this, id: undefined,
      values: this.values.map(r => [...r]),
      highlightedCells: this.highlightedCells.map(h => ({ ...h })),
      highlightSchedule: this.highlightSchedule.map(h => ({ ...h })),
    })
  }

  serialize(): object {
    return { type: 'grid', ...this }
  }

  getBoundingBox(): BoundingBox {
    const w = this.cols * (this.cellWidth + this.cellPadding) - this.cellPadding
    const h = this.rows * (this.cellHeight + this.cellPadding) - this.cellPadding
    return { x: this.x, y: this.y, width: Math.max(0, w), height: Math.max(0, h) }
  }
}

export class ArrayBarShape extends BaseShape {
  values: number[]
  maxValue: number
  barWidth: number
  gap: number
  showIndices: boolean
  showValues: boolean

  constructor(options: Partial<ArrayBarShape> & { name: string }) {
    super(options)
    this.values = options.values ?? [10, 30, 50, 20, 40]
    this.maxValue = options.maxValue ?? Math.max(...this.values, 1)
    this.barWidth = options.barWidth ?? 40
    this.gap = options.gap ?? 4
    this.showIndices = options.showIndices ?? false
    this.showValues = options.showValues ?? false
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const totalW = this.values.length * (this.barWidth + this.gap) - this.gap
    let cx = this.x + (totalW < 0 ? 0 : 0)

    for (let i = 0; i < this.values.length; i++) {
      const barH = (this.values[i] / this.maxValue) * 200
      const bx = this.x + i * (this.barWidth + this.gap)
      const by = this.y + 200 - barH

      ctx.fillStyle = this.fillColor !== 'none' ? this.fillColor : '#4F8EF7'
      ctx.fillRect(bx, by, this.barWidth, barH)

      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = this.strokeWidth
      ctx.strokeRect(bx, by, this.barWidth, barH)

      if (this.showValues) {
        ctx.fillStyle = '#ffffff'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(String(this.values[i]), bx + this.barWidth / 2, by - 5)
      }
      if (this.showIndices) {
        ctx.fillStyle = '#8899aa'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(String(i), bx + this.barWidth / 2, this.y + 200 + 15)
      }
    }
  }

  getBoundingBox(): BoundingBox {
    const w = this.values.length * (this.barWidth + this.gap) - this.gap
    return { x: this.x, y: this.y, width: Math.max(0, w), height: 220 }
  }

  clone(): ArrayBarShape {
    return new ArrayBarShape({ ...this, id: undefined, values: [...this.values] })
  }

  serialize(): object {
    return { type: 'arrayBar', ...this }
  }
}

export class StackShape extends BaseShape {
  items: { label: string; value: any; color: string }[]
  itemWidth: number
  itemHeight: number
  gap: number

  constructor(options: Partial<StackShape> & { name: string }) {
    super(options)
    this.items = options.items ?? []
    this.itemWidth = options.itemWidth ?? 200
    this.itemHeight = options.itemHeight ?? 40
    this.gap = options.gap ?? 2
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.items.length; i++) {
      const y = this.y + (this.items.length - 1 - i) * (this.itemHeight + this.gap)
      ctx.fillStyle = this.items[i].color
      ctx.fillRect(this.x, y, this.itemWidth, this.itemHeight)
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = 1
      ctx.strokeRect(this.x, y, this.itemWidth, this.itemHeight)

      ctx.fillStyle = '#ffffff'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(this.items[i].label, this.x + this.itemWidth / 2, y + this.itemHeight / 2)
    }
  }

  getBoundingBox(): BoundingBox {
    const h = this.items.length * (this.itemHeight + this.gap) - this.gap
    return { x: this.x, y: this.y, width: this.itemWidth, height: Math.max(0, h) }
  }

  clone(): StackShape {
    return new StackShape({ ...this, id: undefined, items: this.items.map(i => ({ ...i })) })
  }

  serialize(): object {
    return { type: 'stack', ...this }
  }
}

export class LinkedListShape extends BaseShape {
  nodes: { label: string; value: any }[]
  direction: 'horizontal' | 'vertical'
  showNullTerminator: boolean
  nodeWidth: number
  nodeHeight: number

  constructor(options: Partial<LinkedListShape> & { name: string }) {
    super(options)
    this.nodes = options.nodes ?? []
    this.direction = options.direction ?? 'horizontal'
    this.showNullTerminator = options.showNullTerminator ?? true
    this.nodeWidth = options.nodeWidth ?? 80
    this.nodeHeight = options.nodeHeight ?? 50
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const gap = 30
    for (let i = 0; i < this.nodes.length; i++) {
      const cx = this.direction === 'horizontal' ? this.x + i * (this.nodeWidth + gap) : this.x
      const cy = this.direction === 'vertical' ? this.y + i * (this.nodeHeight + gap) : this.y

      ctx.fillStyle = '#2a3a5e'
      ctx.fillRect(cx, cy, this.nodeWidth, this.nodeHeight)
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = 1
      ctx.strokeRect(cx, cy, this.nodeWidth, this.nodeHeight)

      ctx.fillStyle = '#ffffff'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(this.nodes[i].label, cx + this.nodeWidth / 2, cy + this.nodeHeight / 2)

      if (i < this.nodes.length - 1) {
        ctx.beginPath()
        if (this.direction === 'horizontal') {
          ctx.moveTo(cx + this.nodeWidth, cy + this.nodeHeight / 2)
          ctx.lineTo(cx + this.nodeWidth + gap, cy + this.nodeHeight / 2)
        } else {
          ctx.moveTo(cx + this.nodeWidth / 2, cy + this.nodeHeight)
          ctx.lineTo(cx + this.nodeWidth / 2, cy + this.nodeHeight + gap)
        }
        ctx.strokeStyle = this.strokeColor
        ctx.lineWidth = 1
        ctx.stroke()

        const arrowX = this.direction === 'horizontal' ? cx + this.nodeWidth + gap - 5 : cx + this.nodeWidth / 2
        const arrowY = this.direction === 'vertical' ? cy + this.nodeHeight + gap - 5 : cy + this.nodeHeight / 2
        ctx.beginPath()
        if (this.direction === 'horizontal') {
          ctx.moveTo(arrowX, arrowY - 4)
          ctx.lineTo(arrowX + 6, arrowY)
          ctx.lineTo(arrowX, arrowY + 4)
        } else {
          ctx.moveTo(arrowX - 4, arrowY)
          ctx.lineTo(arrowX, arrowY + 6)
          ctx.lineTo(arrowX + 4, arrowY)
        }
        ctx.fillStyle = this.strokeColor
        ctx.fill()
      }
    }

    if (this.showNullTerminator) {
      const last = this.nodes.length - 1
      const lx = this.direction === 'horizontal' ? this.x + last * (this.nodeWidth + gap) + this.nodeWidth + gap : this.x + this.nodeWidth + 10
      const ly = this.direction === 'vertical' ? this.y + last * (this.nodeHeight + gap) + this.nodeHeight + gap : this.y + this.nodeHeight / 2 - 10

      ctx.fillStyle = '#555'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('null', lx, ly)
    }
  }

  getBoundingBox(): BoundingBox {
    const count = this.nodes.length
    const w = this.direction === 'horizontal' ? count * (this.nodeWidth + 30) : this.nodeWidth + 40
    const h = this.direction === 'vertical' ? count * (this.nodeHeight + 30) : this.nodeHeight + 20
    return { x: this.x, y: this.y, width: w, height: h }
  }

  clone(): LinkedListShape {
    return new LinkedListShape({ ...this, id: undefined, nodes: this.nodes.map(n => ({ ...n })) })
  }

  serialize(): object {
    return { type: 'linkedList', ...this }
  }
}

interface TreeNode {
  id: string
  value: string | number
  left?: TreeNode
  right?: TreeNode
}

export class BinaryTreeShape extends BaseShape {
  root: TreeNode | null
  levelGap: number
  nodeRadius: number
  highlightedNodes: string[]

  constructor(options: Partial<BinaryTreeShape> & { name: string }) {
    super(options)
    this.root = options.root ?? null
    this.levelGap = options.levelGap ?? 80
    this.nodeRadius = options.nodeRadius ?? 25
    this.highlightedNodes = options.highlightedNodes ?? []
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.root) return
    this.drawNode(ctx, this.root, this.x + 200, this.y, this.levelGap * 2)
  }

  private drawNode(ctx: CanvasRenderingContext2D, node: TreeNode, x: number, y: number, offset: number): void {
    const isHighlighted = this.highlightedNodes.includes(node.id)

    if (node.left) {
      const lx = x - offset
      const ly = y + this.levelGap
      ctx.beginPath()
      ctx.moveTo(x, y + this.nodeRadius)
      ctx.lineTo(lx, ly - this.nodeRadius)
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = 1
      ctx.stroke()
      this.drawNode(ctx, node.left, lx, ly, offset / 2)
    }
    if (node.right) {
      const rx = x + offset
      const ry = y + this.levelGap
      ctx.beginPath()
      ctx.moveTo(x, y + this.nodeRadius)
      ctx.lineTo(rx, ry - this.nodeRadius)
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = 1
      ctx.stroke()
      this.drawNode(ctx, node.right, rx, ry, offset / 2)
    }

    ctx.beginPath()
    ctx.arc(x, y, this.nodeRadius, 0, Math.PI * 2)
    ctx.fillStyle = isHighlighted ? '#F7A24F' : '#2a3a5e'
    ctx.fill()
    ctx.strokeStyle = isHighlighted ? '#ffffff' : this.strokeColor
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(node.value), x, y)
  }

  getBoundingBox(): BoundingBox {
    return { x: this.x, y: this.y, width: 400, height: 300 }
  }

  clone(): BinaryTreeShape {
    const cloneNode = (n: TreeNode | null | undefined): TreeNode | undefined => {
      if (!n) return undefined
      return { ...n, left: cloneNode(n.left), right: cloneNode(n.right) }
    }
    return new BinaryTreeShape({ ...this, id: undefined, root: cloneNode(this.root) as TreeNode ?? null })
  }

  serialize(): object {
    return { type: 'binaryTree', ...this }
  }
}

interface GraphNode {
  id: string
  label: string
  x: number
  y: number
}

interface GraphEdge {
  from: string
  to: string
  weight?: number
  directed?: boolean
}

export class GraphShape extends BaseShape {
  nodes: GraphNode[]
  edges: GraphEdge[]
  nodeRadius: number
  drawProgress: number

  constructor(options: Partial<GraphShape> & { name: string }) {
    super(options)
    this.nodes = options.nodes ?? []
    this.edges = options.edges ?? []
    this.nodeRadius = options.nodeRadius ?? 25
    this.drawProgress = options.drawProgress ?? 1
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const nodeMap = new Map(this.nodes.map(n => [n.id, n]))
    const edgeCount = Math.floor(this.edges.length * this.drawProgress)

    for (let i = 0; i < edgeCount; i++) {
      const edge = this.edges[i]
      const from = nodeMap.get(edge.from)
      const to = nodeMap.get(edge.to)
      if (!from || !to) continue

      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = 1
      ctx.stroke()

      if (edge.directed) {
        const angle = Math.atan2(to.y - from.y, to.x - from.x)
        ctx.beginPath()
        ctx.moveTo(to.x, to.y)
        ctx.lineTo(to.x - 10 * Math.cos(angle - Math.PI / 6), to.y - 10 * Math.sin(angle - Math.PI / 6))
        ctx.lineTo(to.x - 10 * Math.cos(angle + Math.PI / 6), to.y - 10 * Math.sin(angle + Math.PI / 6))
        ctx.closePath()
        ctx.fillStyle = this.strokeColor
        ctx.fill()
      }

      if (edge.weight !== undefined) {
        const mx = (from.x + to.x) / 2
        const my = (from.y + to.y) / 2
        ctx.fillStyle = '#8899aa'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(String(edge.weight), mx, my - 8)
      }
    }

    for (const node of this.nodes) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, this.nodeRadius, 0, Math.PI * 2)
      ctx.fillStyle = '#2a3a5e'
      ctx.fill()
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.label, node.x, node.y)
    }
  }

  getBoundingBox(): BoundingBox {
    if (this.nodes.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
    const xs = this.nodes.map(n => n.x)
    const ys = this.nodes.map(n => n.y)
    const minX = Math.min(...xs) - this.nodeRadius
    const minY = Math.min(...ys) - this.nodeRadius
    const maxX = Math.max(...xs) + this.nodeRadius
    const maxY = Math.max(...ys) + this.nodeRadius
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
  }

  clone(): GraphShape {
    return new GraphShape({
      ...this, id: undefined,
      nodes: this.nodes.map(n => ({ ...n })),
      edges: this.edges.map(e => ({ ...e })),
    })
  }

  serialize(): object {
    return { type: 'graph', ...this }
  }
}

export class CoordinatePlaneShape extends BaseShape {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  tickInterval: number
  showGrid: boolean
  gridColor: string
  labelFont: string

  constructor(options: Partial<CoordinatePlaneShape> & { name: string }) {
    super(options)
    this.xMin = options.xMin ?? -10
    this.xMax = options.xMax ?? 10
    this.yMin = options.yMin ?? -10
    this.yMax = options.yMax ?? 10
    this.tickInterval = options.tickInterval ?? 1
    this.showGrid = options.showGrid ?? true
    this.gridColor = options.gridColor ?? '#2a3a5e'
    this.labelFont = options.labelFont ?? '12px Arial'
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const w = this.xMax - this.xMin
    const h = this.yMax - this.yMin
    const scaleX = 400 / w
    const scaleY = 400 / h
    const ox = this.x + 200
    const oy = this.y + 200

    const toCanvas = (dx: number, dy: number) => ({
      x: ox + dx * scaleX,
      y: oy - dy * scaleY,
    })

    if (this.showGrid) {
      ctx.strokeStyle = this.gridColor
      ctx.lineWidth = 0.5
      for (let x = Math.ceil(this.xMin / this.tickInterval) * this.tickInterval; x <= this.xMax; x += this.tickInterval) {
        if (x === 0) continue
        const px = toCanvas(x, 0).x
        ctx.beginPath()
        ctx.moveTo(px, this.y)
        ctx.lineTo(px, this.y + 400)
        ctx.stroke()
      }
      for (let y = Math.ceil(this.yMin / this.tickInterval) * this.tickInterval; y <= this.yMax; y += this.tickInterval) {
        if (y === 0) continue
        const py = toCanvas(0, y).y
        ctx.beginPath()
        ctx.moveTo(this.x, py)
        ctx.lineTo(this.x + 400, py)
        ctx.stroke()
      }
    }

    ctx.strokeStyle = this.strokeColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(this.x, oy)
    ctx.lineTo(this.x + 400, oy)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(ox, this.y)
    ctx.lineTo(ox, this.y + 400)
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = this.labelFont
    ctx.textAlign = 'center'
    for (let x = Math.ceil(this.xMin / this.tickInterval) * this.tickInterval; x <= this.xMax; x += this.tickInterval) {
      if (x === 0) continue
      const px = toCanvas(x, 0).x
      ctx.fillText(String(x), px, oy + 15)
    }
    for (let y = Math.ceil(this.yMin / this.tickInterval) * this.tickInterval; y <= this.yMax; y += this.tickInterval) {
      if (y === 0) continue
      const py = toCanvas(0, y).y
      ctx.fillText(String(y), ox + 15, py + 4)
    }
    ctx.fillText('0', ox + 10, oy + 15)
  }

  getBoundingBox(): BoundingBox {
    return { x: this.x, y: this.y, width: 400, height: 400 }
  }

  clone(): CoordinatePlaneShape {
    return new CoordinatePlaneShape({ ...this, id: undefined })
  }

  serialize(): object {
    return { type: 'coordinatePlane', ...this }
  }
}
