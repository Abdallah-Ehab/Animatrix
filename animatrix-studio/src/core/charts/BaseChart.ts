import { BaseShape, BoundingBox } from '../shapes/BaseShape'
import type { CustomStyle } from '../shapes/BaseShape'
import type { DataPoint } from '../../utils/mathUtils'

export class ChartAxis {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  width: number
  height: number
  originX: number
  originY: number

  constructor(options: Partial<ChartAxis> = {}) {
    this.xMin = options.xMin ?? 0
    this.xMax = options.xMax ?? 10
    this.yMin = options.yMin ?? 0
    this.yMax = options.yMax ?? 100
    this.width = options.width ?? 600
    this.height = options.height ?? 400
    this.originX = options.originX ?? 50
    this.originY = options.originY ?? 350
  }

  toCanvas(dataX: number, dataY: number): { x: number; y: number } {
    const x = this.originX + ((dataX - this.xMin) / (this.xMax - this.xMin)) * this.width
    const y = this.originY - ((dataY - this.yMin) / (this.yMax - this.yMin)) * this.height
    return { x, y }
  }

  toData(canvasX: number, canvasY: number): { x: number; y: number } {
    const x = this.xMin + ((canvasX - this.originX) / this.width) * (this.xMax - this.xMin)
    const y = this.yMin + ((this.originY - canvasY) / this.height) * (this.yMax - this.yMin)
    return { x, y }
  }
}

export interface AxisStyle {
  color: string
  strokeWidth: number
  tickLength: number
  labelFont: string
  labelColor: string
  arrowHeads: boolean
  showXAxis: boolean
  showYAxis: boolean
  showGrid: boolean
  gridColor: string
  tickInterval: { x: number; y: number }
  labelFormatter: (val: number) => string
}

export interface ChartSeries {
  id: string
  type: 'bar' | 'line' | 'curve' | 'scatter' | 'area'
  data: DataPoint[]
  equation?: string
  xSampleCount?: number
  color: string
  label?: string
  drawProgress: number
  customBarStyle?: CustomStyle
  highlightedIndices?: number[]
}

export abstract class BaseChart extends BaseShape {
  axis: ChartAxis
  series: ChartSeries[]
  axisStyle: AxisStyle
  customAxisStyle?: CustomStyle

  constructor(options: Partial<BaseChart> & { name: string }) {
    super(options)
    this.axis = options.axis ?? new ChartAxis()
    this.series = options.series ?? []
    this.axisStyle = options.axisStyle ?? {
      color: '#ffffff',
      strokeWidth: 2,
      tickLength: 6,
      labelFont: '12px Arial',
      labelColor: '#ffffff',
      arrowHeads: true,
      showXAxis: true,
      showYAxis: true,
      showGrid: true,
      gridColor: '#2a3a5e',
      tickInterval: { x: 1, y: 10 },
      labelFormatter: (v) => String(v),
    }
  }

  addSeries(series: ChartSeries): void {
    this.series.push(series)
  }

  removeSeries(id: string): void {
    this.series = this.series.filter(s => s.id !== id)
  }

  abstract drawSeries(ctx: CanvasRenderingContext2D, series: ChartSeries): void

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawAxes(ctx)
    for (const series of this.series) {
      this.drawSeries(ctx, series)
    }
  }

  protected drawAxes(ctx: CanvasRenderingContext2D): void {
    const a = this.axis
    const s = this.axisStyle
    const { originX, originY } = a

    if (s.showXAxis) {
      ctx.beginPath()
      ctx.moveTo(this.x, originY)
      ctx.lineTo(this.x + a.width + 20, originY)
      ctx.strokeStyle = s.color
      ctx.lineWidth = s.strokeWidth
      ctx.stroke()
    }
    if (s.showYAxis) {
      ctx.beginPath()
      ctx.moveTo(originX, this.y + a.height + 20)
      ctx.lineTo(originX, this.y)
      ctx.strokeStyle = s.color
      ctx.lineWidth = s.strokeWidth
      ctx.stroke()
    }

    if (s.showGrid) {
      ctx.strokeStyle = s.gridColor
      ctx.lineWidth = 0.5
      for (let x = a.xMin + s.tickInterval.x; x < a.xMax; x += s.tickInterval.x) {
        const px = a.toCanvas(x, 0).x
        ctx.beginPath()
        ctx.moveTo(px, this.y)
        ctx.lineTo(px, this.y + a.height)
        ctx.stroke()
      }
      for (let y = a.yMin + s.tickInterval.y; y < a.yMax; y += s.tickInterval.y) {
        const py = a.toCanvas(0, y).y
        ctx.beginPath()
        ctx.moveTo(this.x, py)
        ctx.lineTo(this.x + a.width, py)
        ctx.stroke()
      }
    }

    ctx.fillStyle = s.labelColor
    ctx.font = s.labelFont
    ctx.textAlign = 'center'
    for (let x = a.xMin; x <= a.xMax; x += s.tickInterval.x) {
      const px = a.toCanvas(x, 0).x
      ctx.fillText(s.labelFormatter(x), px, originY + s.tickLength + 14)
    }
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let y = a.yMin; y <= a.yMax; y += s.tickInterval.y) {
      const py = a.toCanvas(0, y).y
      ctx.fillText(s.labelFormatter(y), originX - s.tickLength - 4, py)
    }
  }

  getBoundingBox(): BoundingBox {
    return { x: this.x, y: this.y, width: this.axis.width + 40, height: this.axis.height + 40 }
  }

  abstract serialize(): object
}
