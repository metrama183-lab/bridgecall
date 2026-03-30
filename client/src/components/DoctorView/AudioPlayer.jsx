import { useState, useRef, useEffect } from 'react'
import { AudioManager } from '../../lib/audioManager'

export default function AudioPlayer({ audioBase64 }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)
  const urlRef = useRef(null)

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)

    if (audioBase64) {
      const blob = AudioManager.base64ToBlob(audioBase64)
      urlRef.current = URL.createObjectURL(blob)
    } else {
      urlRef.current = null
    }
    setPlaying(false)
    setProgress(0)
  }, [audioBase64])

  if (!audioBase64) return null

  const handlePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(urlRef.current)
      audioRef.current.ontimeupdate = () => {
        const p = audioRef.current.currentTime / audioRef.current.duration
        setProgress(isNaN(p) ? 0 : p)
      }
      audioRef.current.onended = () => {
        setPlaying(false)
        setProgress(0)
      }
    }

    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  return (
    <div className="audio-player">
      <button className="audio-play-btn" onClick={handlePlay}>
        {playing ? '⏸' : '▶️'}
      </button>
      <div className="audio-progress-bar">
        <div
          className="audio-progress-fill"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <span className="audio-label">Original Audio</span>
    </div>
  )
}
