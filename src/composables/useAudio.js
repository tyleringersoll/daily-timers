export function useAudio(audioSrc = '/alert.mp3') {
  let _audio = null

  const _getAudio = () => {
    if (!_audio) {
      _audio = new Audio(audioSrc)
      _audio.volume = 1.0
    }
    return _audio
  }

  const playSound = async () => {
    try {
      const audio = _getAudio()
      audio.currentTime = 0
      await audio.play()
    } catch {
      // If the cached instance fails (e.g. after an interrupted play), try fresh.
      try {
        const fallback = new Audio(audioSrc)
        await fallback.play()
      } catch (err) {
        console.warn('Audio playback failed:', err)
      }
    }
  }

  return { playSound }
}
