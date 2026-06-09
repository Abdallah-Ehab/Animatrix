import { create } from 'zustand'

interface TimelineState {
  currentFrame: number
  totalFrames: number
  fps: number
  isPlaying: boolean
  snapToFrames: boolean

  setCurrentFrame: (frame: number) => void
  setTotalFrames: (total: number) => void
  setFps: (fps: number) => void
  setIsPlaying: (playing: boolean) => void
  setSnapToFrames: (snap: boolean) => void
}

export const useTimelineStore = create<TimelineState>((set) => ({
  currentFrame: 0,
  totalFrames: 150,
  fps: 30,
  isPlaying: false,
  snapToFrames: true,

  setCurrentFrame: (frame) => set({ currentFrame: Math.max(0, frame) }),
  setTotalFrames: (total) => set({ totalFrames: Math.max(1, total) }),
  setFps: (fps) => set({ fps }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setSnapToFrames: (snap) => set({ snapToFrames: snap }),
}))
