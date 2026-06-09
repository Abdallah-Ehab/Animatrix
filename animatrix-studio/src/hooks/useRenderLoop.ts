import { useEffect, useRef, useCallback } from 'react'
import { RenderEngine } from '../core/engine/RenderEngine'
import { useSceneStore } from '../store/sceneStore'

export function useRenderLoop(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const engineRef = useRef<RenderEngine | null>(null)
  const shapes = useSceneStore(s => s.shapes)
  const layers = useSceneStore(s => s.layers)
  const background = useSceneStore(s => s.background)
  const animationTracks = useSceneStore(s => s.animationTracks)

  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return
    engineRef.current = new RenderEngine(canvasRef.current)
  }, [canvasRef])

  useEffect(() => {
    if (!engineRef.current) return
    engineRef.current.setShapes(shapes)
  }, [shapes])

  useEffect(() => {
    if (!engineRef.current) return
    engineRef.current.setBackground(background)
  }, [background])

  useEffect(() => {
    if (!engineRef.current) return
    const shapeMap = new Map(shapes)
    const layerEntries = Array.from(layers.entries()).map(([id, l]) => [
      id,
      { zIndex: l.data.zIndex, shapes: l.shapes.map(sid => shapes.get(sid)).filter(Boolean) as any[] },
    ] as const)
    const layerMap = new Map(layerEntries)
    engineRef.current.setLayers(layerMap)
  }, [shapes, layers])

  const getEngine = useCallback(() => engineRef.current, [])

  return { getEngine }
}
