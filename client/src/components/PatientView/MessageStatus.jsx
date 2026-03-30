import { Fragment } from 'react'
import { useBridgeStore } from '../../store/bridgeStore'

const STAGES = [
  { key: 'recording', label: 'Recording', icon: '🎙️' },
  { key: 'transcribing', label: 'Transcribing', icon: '📝' },
  { key: 'translating', label: 'Translating', icon: '🌍' },
  { key: 'sending', label: 'Sending', icon: '📡' },
  { key: 'sent', label: 'Sent to relay', icon: '📨' },
  { key: 'seen', label: 'Doctor received', icon: '✅' }
]

export default function MessageStatus() {
  const { processingStage } = useBridgeStore()

  if (!processingStage) return null

  const currentIdx = STAGES.findIndex((s) => s.key === processingStage)

  return (
    <div className="message-status">
      <div className="status-pipeline">
        {STAGES.map((stage, i) => (
          <Fragment key={stage.key}>
            <div
              className={`status-step ${
                i < currentIdx ? 'done' : i === currentIdx ? 'active' : 'pending'
              }`}
            >
              <span className="status-icon">{stage.icon}</span>
              <span className="status-label">{stage.label}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`status-connector ${i < currentIdx ? 'done' : ''}`} />
            )}
          </Fragment>
        ))}
      </div>
      {processingStage === 'sent' && (
        <p className="status-explanation">
          Message sent to broker. Waiting for doctor to come online...
        </p>
      )}
      {processingStage === 'seen' && (
        <p className="status-explanation status-confirmed">
          Doctor has opened your message.
        </p>
      )}
    </div>
  )
}
