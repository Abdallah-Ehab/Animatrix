import { create, all } from 'mathjs'

const math = create(all, {})

export interface DataPoint {
  x: number
  y: number
}

export function sampleEquation(
  equation: string,
  xMin: number,
  xMax: number,
  sampleCount: number
): DataPoint[] {
  const scope: Record<string, number> = {}
  return Array.from({ length: sampleCount }, (_, i) => {
    const x = xMin + (i / (sampleCount - 1)) * (xMax - xMin)
    scope['x'] = x
    const y = math.evaluate(equation, scope) as number
    return { x, y }
  })
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin)
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI
}
