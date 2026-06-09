export type EasingFn = (t: number) => number

export const linear: EasingFn = (t) => t

export const easeInQuad: EasingFn = (t) => t * t

export const easeOutQuad: EasingFn = (t) => t * (2 - t)

export const easeInOutQuad: EasingFn = (t) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export const easeInCubic: EasingFn = (t) => t * t * t

export const easeOutCubic: EasingFn = (t) => {
  return (--t) * t * t + 1
}

export const easeInOutCubic: EasingFn = (t) => {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

export const easeInOutElastic: EasingFn = (t) => {
  if (t === 0 || t === 1) return t
  const c5 = (2 * Math.PI) / 4.5
  return t < 0.5
    ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1
}

export const spring: EasingFn = (t) => {
  return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1
}

export const EASING_FUNCTIONS: Record<string, EasingFn> = {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInOutElastic,
  spring,
}
