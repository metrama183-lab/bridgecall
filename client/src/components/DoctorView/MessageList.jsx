import { useBridgeStore } from '../../store/bridgeStore'

export default function MessageList({ onSelect, selectedId }) {
  const { messages } = useBridgeStore()

  const patientMessages = messages.filter((m) => m.direction === 'patient-to-doctor')

  if (patientMessages.length === 0) {
    return (
      <div className="message-list-empty">
        <span className="empty-icon">📭</span>
        <p>No messages yet</p>
        <p className="empty-sub">Waiting for patient messages...</p>
      </div>
    )
  }

  return (
    <div className="message-list">
      {patientMessages.map((msg) => (
        <button
          key={msg.id}
          className={`message-item ${selectedId === msg.id ? 'selected' : ''}`}
          onClick={() => onSelect(msg)}
        >
          <div className="message-item-header">
            <span className="message-patient-id">
              Patient {msg.patientId.slice(0, 6)}
            </span>
            <span className="message-time">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <div className="message-item-preview">
            {msg.symptoms?.length > 0 && (
              <span className="message-symptoms-badge">
                {msg.symptoms.length} symptoms
              </span>
            )}
            <span className={`message-status-badge ${msg.status}`}>
              {msg.status}
            </span>
          </div>
          {msg.transcriptOriginal && (
            <p className="message-preview-text">
              {msg.transcriptOriginal.slice(0, 80)}
              {msg.transcriptOriginal.length > 80 ? '...' : ''}
            </p>
          )}
        </button>
      ))}
    </div>
  )
}
