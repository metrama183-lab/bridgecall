import { useBridgeStore } from '../../store/bridgeStore'

export default function MessageQueue() {
  const { relayQueue } = useBridgeStore()

  return (
    <div className="message-queue">
      <h3 className="queue-title">
        <span>📦</span> Message Queue
        <span className="queue-count">{relayQueue.length}</span>
      </h3>

      {relayQueue.length === 0 ? (
        <div className="queue-empty">
          <p>No messages in transit</p>
          <p className="queue-empty-sub">Connect to patients nearby to relay their messages</p>
        </div>
      ) : (
        <div className="queue-items">
          {relayQueue.map((msg) => (
            <div key={msg.id} className="queue-item">
              <div className="queue-item-header">
                <span className="queue-patient">
                  Patient {msg.patientId?.slice(0, 6)}
                </span>
                <span className="queue-hops">
                  {msg.hopCount || 0} hops
                </span>
              </div>
              <div className="queue-item-meta">
                <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                <span className={`queue-status ${msg.status}`}>{msg.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
