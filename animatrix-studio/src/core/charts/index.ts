import { BaseChart, ChartSeries } from './BaseChart'
import { BoundingBox } from '../shapes/BaseShape'

export class BarChart extends BaseChart {
  barGap: number
  barRadius: number

  constructor(options: Partial<BarChart> & { name: string }) {
    super(options)
    this.barGap = options.barGap ?? 4
    this.barRadius = options.barRadius ?? 0
  }

  drawSeries(ctx: CanvasRenderingContext2D, series: ChartSeries): void {
    const a = this.axis
    const count = series.data.length
    if (count === 0) return
    const barWidth = (a.width / count) - this.barGap
    const bw = Math.max(barWidth, 2)

    for (let i = 0; i < count; i++) {
      const dp = series.data[i]
      const canvas = a.toCanvas(dp.x, dp.y)
      const base = a.toCanvas(dp.x, a.yMin)
      const barH = base.y - canvas.y
      const isHighlighted = series.highlightedIndices?.includes(i)

      ctx.fillStyle = isHighlighted ? '#F7A24F' : series.color
      const bx = canvas.x - bw / 2
      ctx.beginPath()
      const r = Math.min(this.barRadius, bw / 2, Math.abs(barH) / 2)
      if (r > 0) {
        ctx.moveTo(bx + r, canvas.y)
        ctx.lineTo(bx + bw - r, canvas.y)
        ctx.quadraticCurveTo(bx + bw, canvas.y, bx + bw, canvas.y + r)
        ctx.lineTo(bx + bw, base.y)
        ctx.lineTo(bx, base.y)
        ctx.lineTo(bx, canvas.y + r)
        ctx.quadraticCurveTo(bx, canvas.y, bx + r, canvas.y)
      } else {
        ctx.rect(bx, Math.min(canvas.y, base.y), bw, Math.abs(barH))
      }
      ctx.fill()
    }
  }

  clone(): BarChart {
    return new BarChart({
      ...this, id: undefined,
      series: this.series.map(s => ({ ...s, data: s.data.map(d => ({ ...d })) })),
    })
  }

  serialize(): object {
    return { type: 'barChart', ...this }
  }
}

export class LineChart extends BaseChart {
  drawSeries(ctx: CanvasRenderingContext2D, series: ChartSeries): void {
    const a = this.axis
    const data = series.data
    if (data.length < 2) return
    const count = Math.max(2, Math.floor(data.length * series.drawProgress))

    ctx.beginPath()
    for (let i = 0; i < count; i++) {
      const { x, y } = a.toCanvas(data[i].x, data[i].y)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = series.color
    ctx.lineWidth = this.axisStyle.strokeWidth
    ctx.stroke()
  }

  clone(): LineChart {
    return new LineChart({
      ...this, id: undefined,
      series: this.series.map(s => ({ ...s, data: s.data.map(d => ({ ...d })) })),
    })
  }

  serialize(): object {
    return { type: 'lineChart', ...this }
  }
}

export class CurveChart extends BaseChart {
  interpolation: 'catmullrom' | 'bezier'

  constructor(options: Partial<CurveChart> & { name: string }) {
    super(options)
    this.interpolation = options.interpolation ?? 'catmullrom'
  }

  drawSeries(ctx: CanvasRenderingContext2D, series: ChartSeries): void {
    const a = this.axis
    const data = series.data
    if (data.length < 2) return
    const count = Math.max(2, Math.floor(data.length * series.drawProgress))
    const visible = data.slice(0, count)

    ctx.beginPath()
    if (this.interpolation === 'catmullrom') {
      for (let i = 0; i < visible.length; i++) {
        const { x, y } = a.toCanvas(visible[i].x, visible[i].y)
        if (i === 0) ctx.moveTo(x, y)
        else {
          const prev = a.toCanvas(visible[i - 1].x, visible[i - 1].y)
          const cpx = (prev.x + x) / 2
          ctx.quadraticCurveTo(cpx, prev.y, x, y)
        }
      }
    } else {
      for (let i = 0; i < visible.length; i++) {
        const { x, y } = a.toCanvas(visible[i].x, visible[i].y)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    }
    ctx.strokeStyle = series.color
    ctx.lineWidth = this.axisStyle.strokeWidth
    ctx.stroke()
  }

  clone(): CurveChart {
    return new CurveChart({
      ...this, id: undefined,
      series: this.series.map(s => ({ ...s, data: s.data.map(d => ({ ...d })) })),
    })
  }

  serialize(): object {
    return { type: 'curveChart', ...this }
  }
}

export class ScatterChart extends BaseChart {
  pointRadius: number

  constructor(options: Partial<ScatterChart> & { name: string }) {
    super(options)
    this.pointRadius = options.pointRadius ?? 5
  }

  drawSeries(ctx: CanvasRenderingContext2D, series: ChartSeries): void {
    const a = this.axis
    const count = Math.floor(series.data.length * series.drawProgress)

    for (let i = 0; i < count; i++) {
      const { x, y } = a.toCanvas(series.data[i].x, series.data[i].y)
      ctx.beginPath()
      ctx.arc(x, y, this.pointRadius, 0, Math.PI * 2)
      ctx.fillStyle = series.color
      ctx.fill()
    }
  }

  clone(): ScatterChart {
    return new ScatterChart({
      ...this, id: undefined,
      series: this.series.map(s => ({ ...s, data: s.data.map(d => ({ ...d })) })),
    })
  }

  serialize(): object {
    return { type: 'scatterChart', ...this }
  }
}

export class AreaChart extends LineChart {
  fillOpacity: number

  constructor(options: Partial<AreaChart> & { name: string }) {
    super(options)
    this.fillOpacity = options.fillOpacity ?? 0.3
  }

  drawSeries(ctx: CanvasRenderingContext2D, series: ChartSeries): void {
    const a = this.axis
    const data = series.data
    if (data.length < 2) return
    const count = Math.max(2, Math.floor(data.length * series.drawProgress))
    const visible = data.slice(0, count)

    ctx.beginPath()
    for (let i = 0; i < visible.length; i++) {
      const { x, y } = a.toCanvas(visible[i].x, visible[i].y)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    const last = a.toCanvas(visible[visible.length - 1].x, a.yMin)
    const first = a.toCanvas(visible[0].x, a.yMin)
    ctx.lineTo(last.x, last.y)
    ctx.lineTo(first.x, first.y)
    ctx.closePath()
    ctx.fillStyle = series.color
    ctx.globalAlpha = this.fillOpacity
    ctx.fill()
    ctx.globalAlpha = 1

    ctx.beginPath()
    for (let i = 0; i < visible.length; i++) {
      const { x, y } = a.toCanvas(visible[i].x, visible[i].y)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = series.color
    ctx.lineWidth = this.axisStyle.strokeWidth
    ctx.stroke()
  }

  clone(): AreaChart {
    return new AreaChart({
      ...this, id: undefined,
      series: this.series.map(s => ({ ...s, data: s.data.map(d => ({ ...d })) })),
    })
  }

  serialize(): object {
    return { type: 'areaChart', ...this }
  }
}

export class ComboChart extends BaseChart {
  drawSeries(ctx: CanvasRenderingContext2D, series: ChartSeries): void {
    const sub: Record<string, new (opts: any) => BaseChart> = {
      bar: BarChart,
      line: LineChart,
      curve: CurveChart,
      scatter: ScatterChart,
      area: AreaChart,
    }
    const Ctor = sub[series.type]
    if (!Ctor) return
    const temp = new Ctor({ name: 'temp', axis: this.axis, axisStyle: this.axisStyle })
    temp.drawSeries(ctx, series)
  }

  clone(): ComboChart {
    return new ComboChart({
      ...this, id: undefined,
      series: this.series.map(s => ({ ...s, data: s.data.map(d => ({ ...d })) })),
    })
  }

  serialize(): object {
    return { type: 'comboChart', ...this }
  }
}
