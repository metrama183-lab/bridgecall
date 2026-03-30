import { useRef, useState } from 'react'
import { useBridgeStore } from '../../store/bridgeStore'
import { AudioManager } from '../../lib/audioManager'
import { getDeviceId } from '../../lib/deviceId'
import { publish } from '../../lib/mqttClient'
import { topic } from '../../lib/topicPrefix'

export default function ResponseRecorder({ patientMessage }) {
  const audioRef = useRef(new AudioManager())
  const [recording, setRecording] = useState(false)
  const { addMessage } = useBridgeStore()

  if (!patientMessage) return null

  const handleToggle = async () => {
    if (recording) {
      setRecording(false)
      const blob = await audioRef.current.stopRecording()
      if (!blob) return

      const audioBase64 = await AudioManager.blobToBase64(blob)

      const response = {
        id: crypto.randomUUID(),
        patientId: patientMessage.patientId,
        doctorId: getDeviceId(),
        direction: 'doctor-to-patient',
        audioBase64,
        transcriptOriginal: '',
        transcriptTranslated: '',
        languageDetected: 'en',
        latFuzzy: 0,
        lngFuzzy: 0,
        status: 'sent',
        hopCount: 0,
        createdAt: new Date().toISOString(),
        symptoms: [],
        replyTo: patientMessage.id
      }

      addMessage(response)
      publish(topic(`responses/${patientMessage.patientId}`), response)
    } else {
      await audioRef.current.startRecording()
      setRecording(true)
    }
  }

  return (
    <div className="response-recorder">
      <button
        className={`response-record-btn ${recording ? 'recording' : ''}`}
        onClick={handleToggle}
      >
        {recording ? '⏹ Stop & Send' : '🎙️ Record Response'}
      </button>
    </div>
  )
}
