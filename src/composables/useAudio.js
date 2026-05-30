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
    } catch (error) {
      console.warn('Audio playback failed:', error)
      try {
        const fallback = new Audio(audioSrc)
        await fallback.play()
      } catch (err) {
        console.warn('Fallback audio failed:', err)
      }
    }
  }

  return { playSound }
}
