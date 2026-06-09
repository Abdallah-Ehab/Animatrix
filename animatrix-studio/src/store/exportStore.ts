import { create } from 'zustand'
import type { ExportConfig } from '../core/engine/ExportEngine'

interface ExportState {
  config: ExportConfig
  isExporting: boolean
  progress: { rendered: number; total: number }
  exportResult: Blob | null

  setConfig: (config: Partial<ExportConfig>) => void
  setIsExporting: (val: boolean) => void
  setProgress: (rendered: number, total: number) => void
  setExportResult: (blob: Blob | null) => void
  reset: () => void
}

const DEFAULT_CONFIG: ExportConfig = {
  format: 'mp4',
  width: 1920,
  height: 1080,
  fps: 30,
  startFrame: 0,
  endFrame: 150,
  quality: 'medium',
}

export const useExportStore = create<ExportState>((set) => ({
  config: { ...DEFAULT_CONFIG },
  isExporting: false,
  progress: { rendered: 0, total: 0 },
  exportResult: null,

  setConfig: (partial) => set((s) => ({ config: { ...s.config, ...partial } })),
  setIsExporting: (val) => set({ isExporting: val }),
  setProgress: (rendered, total) => set({ progress: { rendered, total } }),
  setExportResult: (blob) => set({ exportResult: blob }),
  reset: () => set({
    config: { ...DEFAULT_CONFIG },
    isExporting: false,
    progress: { rendered: 0, total: 0 },
    exportResult: null,
  }),
}))
