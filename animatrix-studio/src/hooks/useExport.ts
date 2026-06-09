import { useCallback } from 'react'
import { ExportEngine } from '../core/engine/ExportEngine'
import { useSceneStore } from '../store/sceneStore'
import { useExportStore } from '../store/exportStore'

export function useExport() {
  const shapes = useSceneStore(s => s.shapes)
  const background = useSceneStore(s => s.background)
  const animationTracks = useSceneStore(s => s.animationTracks)
  const { config, setIsExporting, setProgress, setExportResult } = useExportStore()

  const startExport = useCallback(async (overrides?: Partial<typeof config>) => {
    const finalConfig = { ...config, ...overrides }
    setIsExporting(true)
    setProgress(0, finalConfig.endFrame - finalConfig.startFrame + 1)

    const engine = new ExportEngine()
    engine.configure(finalConfig as any)
    engine.onProgressCallback((rendered, total) => setProgress(rendered, total))

    await new Promise<void>((resolve) => {
      engine.onCompleteCallback((blob) => {
        setExportResult(blob)
        resolve()
      })
      engine.start(shapes, animationTracks as any, background)
    })

    setIsExporting(false)
  }, [config, shapes, animationTracks, background, setIsExporting, setProgress, setExportResult])

  return { startExport }
}
