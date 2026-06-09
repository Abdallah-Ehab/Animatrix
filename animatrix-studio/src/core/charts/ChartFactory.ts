import { BarChart, LineChart, CurveChart, ScatterChart, AreaChart, ComboChart } from './'
import type { ChartType } from '../../constants'

export class ChartFactory {
  static createChart(type: ChartType | string, options: Record<string, any>): any {
    switch (type) {
      case 'bar': return new BarChart(options as any)
      case 'line': return new LineChart(options as any)
      case 'curve': return new CurveChart(options as any)
      case 'scatter': return new ScatterChart(options as any)
      case 'area': return new AreaChart(options as any)
      case 'combo': return new ComboChart(options as any)
      default: throw new Error(`Unknown chart type: ${type}`)
    }
  }
}
