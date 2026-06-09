import { create } from 'zustand'
import { BaseShape } from '../core/shapes/BaseShape'

function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.slice(1), 16)
  const bh = parseInt(b.slice(1), 16)
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff
  const rr = Math.round(ar + (br - ar) * t)
  const rg = Math.round(ag + (bg - ag) * t)
  const rb = Math.round(ab + (bb - ab) * t)
  return `#${((1 << 24) | (rr << 16) | (rg << 8) | rb).toString(16).slice(1)}`
}

export interface Background {
  type: 'solid' | 'gradient' | 'image' | 'grid' | 'dots'
  color?: string
  gradient?: { type: 'linear' | 'radial'; stops: { offset: number; color: string }[]; angle?: number }
  imageUrl?: string
  imageOpacity?: number
  imageBlur?: number
  gridColor?: string
  gridSize?: number
  dotColor?: string
  dotSpacing?: number
  dotRadius?: number
}

export interface Keyframe {
  frame: number
  properties: Record<string, any>
}

export interface AnimationTrack {
  id: string
  targetId: string
  property: string
  keyframes: Keyframe[]
  easing: string
}

interface LayerData {
  id: string
  name: string
  zIndex: number
  visible: boolean
  locked: boolean
}

interface SceneState {
  shapes: Map<string, BaseShape>
  layers: Map<string, { data: LayerData; shapes: string[] }>
  background: Background
  selectedShapeIds: string[]
  animationTracks: AnimationTrack[]

  addShape: (shape: BaseShape, layerId?: string) => void
  removeShape: (id: string) => void
  updateShape: (id: string, updates: Partial<BaseShape>) => void
  selectShape: (id: string | null, multi?: boolean) => void
  deselectAll: () => void
  setBackground: (bg: Background) => void
  addLayer: (layer: LayerData) => void
  moveShapeToLayer: (shapeId: string, layerId: string) => void
  reorderShape: (shapeId: string, newZIndex: number) => void

  addAnimationTrack: (track: AnimationTrack) => void
  removeAnimationTrack: (id: string) => void
  updateAnimationTrack: (id: string, updates: Partial<AnimationTrack>) => void
  addKeyframe: (trackId: string, keyframe: Keyframe) => void
  removeKeyframe: (trackId: string, frame: number) => void
  getAnimatedValue: (property: string, targetId: string, frame: number) => any
}

export const useSceneStore = create<SceneState>((set, get) => ({
  shapes: new Map(),
  layers: new Map([['default', {
    data: { id: 'default', name: 'Default Layer', zIndex: 0, visible: true, locked: false },
    shapes: [],
  }]]),
  background: { type: 'solid', color: '#1a1a2e' },
  selectedShapeIds: [],
  animationTracks: [],

  addShape: (shape, layerId) => {
    set((state) => {
      const shapes = new Map(state.shapes)
      shapes.set(shape.id, shape)
      const layers = new Map(state.layers)
      const lid = layerId ?? 'default'
      const layer = layers.get(lid)
      if (layer) {
        layer.shapes.push(shape.id)
      }
      return { shapes, layers }
    })
  },

  removeShape: (id) => {
    set((state) => {
      const shapes = new Map(state.shapes)
      shapes.delete(id)
      const layers = new Map(state.layers)
      for (const [, layer] of layers) {
        layer.shapes = layer.shapes.filter(sid => sid !== id)
      }
      return {
        shapes,
        layers,
        selectedShapeIds: state.selectedShapeIds.filter(sid => sid !== id),
        animationTracks: state.animationTracks.filter(t => t.targetId !== id),
      }
    })
  },

  updateShape: (id, updates) => {
    set((state) => {
      const shapes = new Map(state.shapes)
      const shape = shapes.get(id)
      if (shape) {
        Object.assign(shape, updates)
      }
      return { shapes }
    })
  },

  selectShape: (id, multi) => {
    set((state) => {
      if (id === null) return { selectedShapeIds: [] }
      if (multi) {
        const exists = state.selectedShapeIds.includes(id)
        return {
          selectedShapeIds: exists
            ? state.selectedShapeIds.filter(sid => sid !== id)
            : [...state.selectedShapeIds, id],
        }
      }
      return { selectedShapeIds: [id] }
    })
  },

  deselectAll: () => set({ selectedShapeIds: [] }),

  setBackground: (bg) => set({ background: bg }),

  addLayer: (layer) => {
    set((state) => {
      const layers = new Map(state.layers)
      layers.set(layer.id, { data: layer, shapes: [] })
      return { layers }
    })
  },

  moveShapeToLayer: (shapeId, layerId) => {
    set((state) => {
      const layers = new Map(state.layers)
      for (const [, layer] of layers) {
        layer.shapes = layer.shapes.filter(sid => sid !== shapeId)
      }
      const target = layers.get(layerId)
      if (target) target.shapes.push(shapeId)
      return { layers }
    })
  },

  reorderShape: (shapeId, newZIndex) => {
    set((state) => {
      const shapes = new Map(state.shapes)
      const shape = shapes.get(shapeId)
      if (shape) {
        shape.zIndex = newZIndex
      }
      return { shapes }
    })
  },

  addAnimationTrack: (track) => {
    set((state) => ({
      animationTracks: [...state.animationTracks, track],
    }))
  },

  removeAnimationTrack: (id) => {
    set((state) => ({
      animationTracks: state.animationTracks.filter(t => t.id !== id),
    }))
  },

  updateAnimationTrack: (id, updates) => {
    set((state) => ({
      animationTracks: state.animationTracks.map(t => t.id === id ? { ...t, ...updates } : t),
    }))
  },

  addKeyframe: (trackId, keyframe) => {
    set((state) => ({
      animationTracks: state.animationTracks.map(t => {
        if (t.id !== trackId) return t
        const existing = t.keyframes.findIndex(k => k.frame === keyframe.frame)
        const keyframes = existing >= 0
          ? t.keyframes.map((k, i) => i === existing ? keyframe : k)
          : [...t.keyframes, keyframe].sort((a, b) => a.frame - b.frame)
        return { ...t, keyframes }
      }),
    }))
  },

  removeKeyframe: (trackId, frame) => {
    set((state) => ({
      animationTracks: state.animationTracks.map(t => {
        if (t.id !== trackId) return t
        return { ...t, keyframes: t.keyframes.filter(k => k.frame !== frame) }
      }),
    }))
  },

  getAnimatedValue: (property, targetId, frame) => {
    const state = get()
    const tracks = state.animationTracks.filter(
      t => t.targetId === targetId && t.property === property
    )
    if (tracks.length === 0) return undefined

    for (const track of tracks) {
      if (track.keyframes.length === 0) continue
      if (track.keyframes.length === 1) {
        return track.keyframes[0].properties[property]
      }

      const sorted = [...track.keyframes].sort((a, b) => a.frame - b.frame)
      if (frame <= sorted[0].frame) return sorted[0].properties[property]
      if (frame >= sorted[sorted.length - 1].frame) return sorted[sorted.length - 1].properties[property]

      for (let i = 0; i < sorted.length - 1; i++) {
        const kfA = sorted[i]
        const kfB = sorted[i + 1]
        if (frame >= kfA.frame && frame <= kfB.frame) {
          const t = kfB.frame === kfA.frame ? 0 : (frame - kfA.frame) / (kfB.frame - kfA.frame)
          const valA = kfA.properties[property]
          const valB = kfB.properties[property]
          if (typeof valA === 'number' && typeof valB === 'number') {
            return valA + (valB - valA) * t
          }
          if (typeof valA === 'string' && typeof valB === 'string' &&
              valA.startsWith('#') && valB.startsWith('#')) {
            return lerpColor(valA, valB, t)
          }
          return t < 0.5 ? valA : valB
        }
      }
    }
    return undefined
  },
}))
