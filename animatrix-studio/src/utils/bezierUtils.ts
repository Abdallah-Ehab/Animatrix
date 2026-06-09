export interface Point {
  x: number
  y: number
}

export function chaikinSmooth(points: Point[], iterations: number = 2): Point[] {
  if (points.length < 3) return points
  let pts = [...points]
  for (let iter = 0; iter < iterations; iter++) {
    const smoothed: Point[] = [pts[0]]
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i]
      const p1 = pts[i + 1]
      smoothed.push({ x: p0.x * 0.75 + p1.x * 0.25, y: p0.y * 0.75 + p1.y * 0.25 })
      smoothed.push({ x: p0.x * 0.25 + p1.x * 0.75, y: p0.y * 0.25 + p1.y * 0.75 })
    }
    smoothed.push(pts[pts.length - 1])
    pts = smoothed
  }
  return pts
}

export function catmullRom(points: Point[], segments: number = 20): Point[] {
  if (points.length < 2) return points
  const result: Point[] = []
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    for (let t = 0; t <= segments; t++) {
      const s = t / segments
      const s2 = s * s
      const s3 = s2 * s
      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * s +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * s2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * s3
      )
      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * s +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * s2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s3
      )
      if (i === 0 && t === 0) {
        result.push({ x: p1.x, y: p1.y })
      }
      result.push({ x, y })
    }
  }
  return result
}

export function quadraticBezier(
  p0: Point, p1: Point, p2: Point, t: number
): Point {
  const mt = 1 - t
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  }
}

export function cubicBezier(
  p0: Point, p1: Point, p2: Point, p3: Point, t: number
): Point {
  const mt = 1 - t
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  }
}
