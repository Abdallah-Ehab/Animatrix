import { create } from 'zustand'
import type { BrushMode } from '../constants'

export type ToolType = 'select' | 'pan' | 'rect' | 'circle' | 'ellipse' | 'line' | 'arrow' | 'curve' | 'text' | 'polygon' | 'brush' | 'eraser'

interface TransformMode {
  active: false | 'move' | 'resize' | 'rotate'
  handle?: string
  startX: number
  startY: number
  originalShape: Record<string, any> | null
}

interface UIState {
  activeTool: ToolType
  brushMode: BrushMode
  brushSize: number
  brushColor: string
  brushOpacity: number
  brushSmoothing: number
  showGrid: boolean
  snapToGrid: boolean
  transform: TransformMode
  showPathOfMotion: boolean
  showOnionSkinning: boolean

  togglePathOfMotion: () => void
  toggleOnionSkinning: () => void
  panelVisibility: {
    layers: boolean
    inspector: boolean
    shapeLibrary: boolean
    brushPanel: boolean
    timeline: boolean
    exportModal: boolean
  }

  setActiveTool: (tool: ToolType) => void
  setBrushMode: (mode: BrushMode) => void
  setBrushSize: (size: number) => void
  setBrushColor: (color: string) => void
  setBrushOpacity: (opacity: number) => void
  setBrushSmoothing: (smoothing: number) => void
  toggleGrid: () => void
  toggleSnap: () => void
  setTransform: (t: TransformMode) => void
  togglePanel: (panel: keyof UIState['panelVisibility']) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTool: 'select',
  brushMode: 'pen',
  brushSize: 8,
  brushColor: '#ffffff',
  brushOpacity: 1,
  brushSmoothing: 0.5,
  showGrid: false,
  snapToGrid: false,
  transform: { active: false, handle: undefined, startX: 0, startY: 0, originalShape: null },
  showPathOfMotion: true,
  showOnionSkinning: true,
  panelVisibility: {
    layers: true,
    inspector: true,
    shapeLibrary: false,
    brushPanel: false,
    timeline: true,
    exportModal: false,
  },

  setActiveTool: (tool) => set({ activeTool: tool }),
  setBrushMode: (mode) => set({ brushMode: mode }),
  setBrushSize: (size) => set({ brushSize: Math.max(1, Math.min(100, size)) }),
  setBrushColor: (color) => set({ brushColor: color }),
  setBrushOpacity: (opacity) => set({ brushOpacity: Math.max(0, Math.min(1, opacity)) }),
  setBrushSmoothing: (smoothing) => set({ brushSmoothing: Math.max(0, Math.min(1, smoothing)) }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
  togglePathOfMotion: () => set((s) => ({ showPathOfMotion: !s.showPathOfMotion })),
  toggleOnionSkinning: () => set((s) => ({ showOnionSkinning: !s.showOnionSkinning })),
  setTransform: (t) => set({ transform: t }),
  togglePanel: (panel) => set((s) => ({
    panelVisibility: { ...s.panelVisibility, [panel]: !s.panelVisibility[panel] },
  })),
}))
