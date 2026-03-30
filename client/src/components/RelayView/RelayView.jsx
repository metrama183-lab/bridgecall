import { useBridgeStore } from '../../store/bridgeStore'
import MessageQueue from './MessageQueue'
import ConnectButton from './ConnectButton'

export default function RelayView() {
  const { p2pStatus } = useBridgeStore()

  return (
    <div className="relay-view">
      <header className="relay-header">
        <div className={`connection-dot ${p2pStatus === 'connected' ? 'connected' : 'offline'}`} />
        <h2>Relay Node</h2>
      </header>

      <div className="relay-content">
        <div className="relay-status-card">
          <div className="relay-icon">📡</div>
          <h3>You are a relay node</h3>
          <p>Your phone carries messages from patients to doctors when no internet is available.</p>
        </div>

        <MessageQueue />
        <ConnectButton />
      </div>
    </div>
  )
}
