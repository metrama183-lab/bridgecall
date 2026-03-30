import { useState, useRef, useEffect } from 'react'
import { useBridgeStore } from '../../store/bridgeStore'

export default function RecordButton({ onRecordingStart, onRecordingComplete }) {
  const { isRecording } = useBridgeStore()
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (isRecording) {
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isRecording])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const handlePress = () => {
    if (isRecording) {
      onRecordingComplete?.()
    } else {
      onRecordingStart?.()
    }
  }

  return (
    <div className="record-button-container">
      <button
        className={`record-button ${isRecording ? 'recording' : ''}`}
        onClick={handlePress}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <div className="record-button-inner">
          {isRecording ? (
            <div className="record-stop-icon" />
          ) : (
            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </div>
      </button>
      {isRecording && (
        <div className="record-timer">{formatTime(elapsed)}</div>
      )}
      <p className="record-label">
        {isRecording ? 'Tap to stop' : 'Tap to speak'}
      </p>
    </div>
  )
}
