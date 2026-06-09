export const FPS_OPTIONS = [24, 30, 60] as const
export const DEFAULT_FPS = 30
export const DEFAULT_WIDTH = 1920
export const DEFAULT_HEIGHT = 1080
export const MIN_BRUSH_SIZE = 2
export const MAX_BRUSH_SIZE = 100
export const DEFAULT_BRUSH_SIZE = 8
export const DEFAULT_OPACITY = 1
export const DEFAULT_SMOOTHING = 0.5
export const MAX_Z_INDEX = 9999
export const SNAP_THRESHOLD = 5
export const GRID_SIZE = 20

export const COLOR_DEFAULTS = {
  primary: '#4F8EF7',
  secondary: '#F7A24F',
  success: '#4CAF50',
  danger: '#EF5350',
  background: '#1a1a2e',
  surface: '#16213e',
  text: '#ffffff',
  textSecondary: '#8899aa',
  border: '#2a3a5e',
} as const

export const PLATFORM_PRESETS = {
  youtube_landscape: { label: 'YouTube (Landscape)', width: 1920, height: 1080, fps: 30, aspectRatio: '16:9' as const },
  youtube_shorts: { label: 'YouTube Shorts', width: 1080, height: 1920, fps: 60, aspectRatio: '9:16' as const },
  instagram_post: { label: 'Instagram Post (Square)', width: 1080, height: 1080, fps: 30, aspectRatio: '1:1' as const },
  instagram_reel: { label: 'Instagram Reels', width: 1080, height: 1920, fps: 30, aspectRatio: '9:16' as const },
  tiktok: { label: 'TikTok', width: 1080, height: 1920, fps: 60, aspectRatio: '9:16' as const },
  twitter_landscape: { label: 'Twitter / X (Landscape)', width: 1280, height: 720, fps: 30, aspectRatio: '16:9' as const },
  presentation: { label: 'Presentation (4K)', width: 3840, height: 2160, fps: 60, aspectRatio: '16:9' as const },
  custom: { label: 'Custom', width: null as number | null, height: null as number | null, fps: null as number | null, aspectRatio: null as string | null },
} as const

export const CRF_MAP = { high: 18, medium: 23, low: 28 } as const

export const BACKGROUND_PRESETS = [
  { label: 'Black (3B1B)', color: '#000000' },
  { label: 'Dark Navy', color: '#1a1a2e' },
  { label: 'White', color: '#ffffff' },
  { label: 'Transparent', color: 'transparent' },
] as const

export const BRUSH_MODES = ['pen', 'marker', 'chalk', 'ink', 'eraser'] as const
export type BrushMode = typeof BRUSH_MODES[number]

export const SHAPE_TYPES = [
  'rect', 'circle', 'ellipse', 'line', 'curve', 'arrow', 'text', 'polygon', 'group',
  'grid', 'arrayBar', 'stack', 'linkedList', 'binaryTree', 'graph', 'coordinatePlane',
] as const
export type ShapeType = typeof SHAPE_TYPES[number]

export const CHART_TYPES = ['bar', 'line', 'curve', 'scatter', 'area', 'combo'] as const
export type ChartType = typeof CHART_TYPES[number]

export const ANIMATION_PRESETS = ['fade', 'drawLine', 'growBar', 'highlightCell', 'stagger', 'trail'] as const
export type AnimationPreset = typeof ANIMATION_PRESETS[number]

export const FX_TYPES = ['outerGlow', 'innerGlow', 'dropShadow', 'strokeGlow', 'colorOverlay', 'blur'] as const
export type FXType = typeof FX_TYPES[number]

export const INTERPOLATION_TYPES = ['catmullrom', 'bezier'] as const
export type InterpolationType = typeof INTERPOLATION_TYPES[number]

export const CAP_STYLES = ['none', 'arrow', 'dot'] as const
export type CapStyle = typeof CAP_STYLES[number]

export const HEAD_STYLES = ['filled', 'outline', 'double'] as const
export type HeadStyle = typeof HEAD_STYLES[number]

export const TEXT_ALIGNS = ['left', 'center', 'right'] as const
export type TextAlign = typeof TEXT_ALIGNS[number]

export const BACKGROUND_TYPES = ['solid', 'gradient', 'image', 'grid', 'dots'] as const
export type BackgroundType = typeof BACKGROUND_TYPES[number]
