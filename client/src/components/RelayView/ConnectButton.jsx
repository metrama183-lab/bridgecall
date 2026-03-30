import { useState } from 'react'
import { useBridgeStore } from '../../store/bridgeStore'
import { publish } from '../../lib/mqttClient'
import { topic } from '../../lib/topicPrefix'

export default function ConnectButton() {
  const [simulating, setSimulating] = useState(false)
  const { relayQueue, removeFromRelayQueue, connectionStatus, setConnectionStatus } = useBridgeStore()

  const simulateUplink = async () => {
    setSimulating(true)
    setConnectionStatus('connecting')

    await new Promise((r) => setTimeout(r, 1500))
    setConnectionStatus('connected')

    for (const msg of relayQueue) {
      await new Promise((r) => setTimeout(r, 800))
      publish(topic(`messages/${msg.patientId}`), {
        ...msg,
        status: 'relayed',
        hopCount: (msg.hopCount || 0) + 1
      })
      removeFromRelayQueue(msg.id)
    }

    setSimulating(false)
  }

  return (
    <div className="connect-button-container">
      <button
        className={`connect-btn ${simulating ? 'active' : ''}`}
        onClick={simulateUplink}
        disabled={simulating || relayQueue.length === 0}
      >
        {simulating ? (
          <>
            <span className="connect-spinner" />
            Sending {relayQueue.length} messages...
          </>
        ) : (
          <>
            <span className="connect-icon">📡</span>
            {relayQueue.length > 0
              ? `Found 2G — Send ${relayQueue.length} messages`
              : 'No messages to relay'}
          </>
        )}
      </button>

      <div className="connection-info">
        <div className={`connection-indicator ${connectionStatus}`} />
        <span>{connectionStatus === 'connected' ? 'Uplink active' : 'Searching for signal...'}</span>
      </div>
    </div>
  )
}
