import { useRef, useEffect } from 'react'
import { useBridgeStore } from '../../store/bridgeStore'
import { AudioManager } from '../../lib/audioManager'
import { getLocation } from '../../lib/locationHelper'
import { getDeviceId } from '../../lib/deviceId'
import { publish, subscribe } from '../../lib/mqttClient'
import { topic } from '../../lib/topicPrefix'
import { getWhisperWorker, getTranslateWorker } from '../../lib/aiWorkers'
import RecordButton from './RecordButton'
import BodyMap from './BodyMap'
import SymptomsGrid from './SymptomsGrid'
import MessageStatus from './MessageStatus'

export default function PatientView() {
  const audioRef = useRef(new AudioManager())

  const {
    isRecording,
    setIsRecording,
    selectedSymptoms,
    clearSymptoms,
    setProcessingStage,
    addMessage,
    updateMessage,
    whisperReady,
    translatorReady,
    whisperLoading,
    translatorLoading,
    whisperProgress,
    translatorProgress,
    patientLanguage,
    setPatientLanguage,
    connectionStatus
  } = useBridgeStore()

  useEffect(() => {
    const deviceId = getDeviceId()
    const unsub = subscribe(topic(`ack/${deviceId}`), (ack) => {
      if (ack.messageId) {
        updateMessage(ack.messageId, { status: 'seen' })
        setProcessingStage('seen')
        setTimeout(() => setProcessingStage(null), 4000)
      }
    })
    return unsub
  }, [updateMessage, setProcessingStage])

  const handleRecordingStart = () => {
    audioRef.current.startRecording()
    setIsRecording(true)
    setProcessingStage('recording')
  }

  const handleRecordingComplete = async () => {
    setIsRecording(false)
    const blob = await audioRef.current.stopRecording()
    if (!blob) return

    const messageId = crypto.randomUUID()
    const audioBase64 = await AudioManager.blobToBase64(blob)
    const location = await getLocation()

    const msg = {
      id: messageId,
      patientId: getDeviceId(),
      direction: 'patient-to-doctor',
      audioBase64,
      transcriptOriginal: '',
      transcriptTranslated: '',
      languageDetected: patientLanguage,
      latFuzzy: location?.lat || 0,
      lngFuzzy: location?.lng || 0,
      status: 'pending',
      hopCount: 0,
      createdAt: new Date().toISOString(),
      symptoms: [...selectedSymptoms]
    }

    addMessage(msg)

    if (whisperReady) {
      setProcessingStage('transcribing')
      const whisperWorker = getWhisperWorker()
      try {
        const float32 = await AudioManager.blobToFloat32(blob)

        const transcriptPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => resolve(''), 30000)
          const handler = ({ data }) => {
            if (data.type === 'result') {
              clearTimeout(timeout)
              whisperWorker.removeEventListener('message', handler)
              resolve(data.text)
            }
            if (data.type === 'error') {
              clearTimeout(timeout)
              whisperWorker.removeEventListener('message', handler)
              reject(new Error(data.message))
            }
          }
          whisperWorker.addEventListener('message', handler)
          whisperWorker.postMessage({
            type: 'transcribe',
            audio: float32,
            language: patientLanguage === 'auto' ? null : patientLanguage
          })
        })

        msg.transcriptOriginal = await transcriptPromise
      } catch (err) {
        console.error('[Whisper] Transcription failed:', err)
        msg.transcriptOriginal = '[Audio recorded — transcription unavailable for this language]'
      }

      if (msg.transcriptOriginal && translatorReady && patientLanguage !== 'en') {
        setProcessingStage('translating')
        const translateWorker = getTranslateWorker()
        try {
          const translatePromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => resolve(''), 30000)
            const handler = ({ data }) => {
              if (data.type === 'result') {
                clearTimeout(timeout)
                translateWorker.removeEventListener('message', handler)
                resolve(data.translatedText)
              }
              if (data.type === 'error') {
                clearTimeout(timeout)
                translateWorker.removeEventListener('message', handler)
                reject(new Error(data.message))
              }
            }
            translateWorker.addEventListener('message', handler)
            translateWorker.postMessage({
              type: 'translate',
              text: msg.transcriptOriginal,
              srcLang: patientLanguage === 'auto' ? 'en' : patientLanguage,
              tgtLang: 'en'
            })
          })
          msg.transcriptTranslated = await translatePromise
        } catch (err) {
          console.error('[Translator] Translation failed:', err)
        }
      }
    }

    setProcessingStage('sending')
    msg.status = 'sent'

    publish(topic(`messages/${getDeviceId()}`), msg)
    updateMessage(msg.id, { status: 'sent' })

    setProcessingStage('sent')
    clearSymptoms()
  }

  const LANGUAGES = [
    { code: 'auto', label: 'Auto-detect' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
    { code: 'es', label: 'Español' },
    { code: 'sw', label: 'Kiswahili' },
    { code: 'pt', label: 'Português' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'zh', label: '中文' },
    { code: 'ru', label: 'Русский' },
    { code: 'bn', label: 'বাংলা' }
  ]

  return (
    <div className="patient-view">
      <header className="patient-header">
        <div className={`connection-dot ${connectionStatus}`} />
        <h2>BridgeCall</h2>
        <select
          className="language-select"
          value={patientLanguage}
          onChange={(e) => setPatientLanguage(e.target.value)}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </header>

      <div className="patient-content">
        <RecordButton
          onRecordingStart={handleRecordingStart}
          onRecordingComplete={handleRecordingComplete}
        />

        <MessageStatus />

        <SymptomsGrid />
        <BodyMap />
      </div>
    </div>
  )
}
