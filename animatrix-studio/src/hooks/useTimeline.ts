import { useCallback } from 'react'
import { useTimelineStore } from '../store/timelineStore'
import { useSceneStore } from '../store/sceneStore'

export function useTimeline() {
  const {
    currentFrame, totalFrames, fps, isPlaying,
    setCurrentFrame, setTotalFrames, setFps, setIsPlaying,
  } = useTimelineStore()

  const animationTracks = useSceneStore(s => s.animationTracks)

  const play = useCallback(() => setIsPlaying(true), [setIsPlaying])
  const pause = useCallback(() => setIsPlaying(false), [setIsPlaying])
  const stop = useCallback(() => { setCurrentFrame(0); setIsPlaying(false) }, [setCurrentFrame, setIsPlaying])
  const goToFrame = useCallback((frame: number) => setCurrentFrame(frame), [setCurrentFrame])

  return {
    play,
    pause,
    stop,
    goToFrame,
    currentFrame,
    totalFrames,
    isPlaying,
    fps,
    setFps,
    setTotalFrames,
    animationTracks,
  }
}
