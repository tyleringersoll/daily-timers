import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAudio } from './useAudio'

describe('useAudio', () => {
  let mockAudio

  beforeEach(() => {
    mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      currentTime: 0,
      volume: 1.0,
    }
    global.Audio = vi.fn().mockImplementation(() => mockAudio)
    console.warn = vi.fn()
  })

  it('creates an Audio instance with the default src on first playSound call', async () => {
    const { playSound } = useAudio()
    await playSound()
    expect(global.Audio).toHaveBeenCalledWith('/alert.mp3')
  })

  it('creates an Audio instance with a custom src on first playSound call', async () => {
    const { playSound } = useAudio('/custom.mp3')
    await playSound()
    expect(global.Audio).toHaveBeenCalledWith('/custom.mp3')
  })

  it('plays sound and resets currentTime to 0', async () => {
    const { playSound } = useAudio()
    await playSound()
    expect(mockAudio.currentTime).toBe(0)
    expect(mockAudio.play).toHaveBeenCalled()
  })

  it('warns and tries fallback when primary audio fails', async () => {
    mockAudio.play.mockRejectedValueOnce(new Error('Audio failed'))
    const { playSound } = useAudio()
    await playSound()
    expect(console.warn).toHaveBeenCalledWith('Audio playback failed:', expect.any(Error))
    // primary Audio + fallback Audio
    expect(global.Audio).toHaveBeenCalledTimes(2)
  })

  it('warns twice when both primary and fallback fail', async () => {
    mockAudio.play.mockRejectedValue(new Error('Audio failed'))
    const { playSound } = useAudio()
    await playSound()
    expect(console.warn).toHaveBeenCalledTimes(2)
    expect(console.warn).toHaveBeenCalledWith('Audio playback failed:', expect.any(Error))
    expect(console.warn).toHaveBeenCalledWith('Fallback audio failed:', expect.any(Error))
  })
})
