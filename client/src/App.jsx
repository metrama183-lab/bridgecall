import { useEffect } from 'react'
import { useBridgeStore } from './store/bridgeStore'
import { getClient } from './lib/mqttClient'
import { initAIWorkers } from './lib/aiWorkers'
import PatientView from './components/PatientView/PatientView'
import DoctorView from './components/DoctorView/DoctorView'
import RelayView from './components/RelayView/RelayView'
import QRExchange from './components/QRExchange/QRExchange'

const VIEW_LABELS = [
  { key: 'patient', icon: '🏥', label: 'Patient' },
  { key: 'relay', icon: '📡', label: 'Relay' },
  { key: 'doctor', icon: '👨‍⚕️', label: 'Doctor' }
]

function AIProgressBar() {
  const {
    whisperLoading, translatorLoading,
    whisperReady, translatorReady,
    whisperProgress, translatorProgress
  } = useBridgeStore()

  const loading = whisperLoading || translatorLoading
  const allReady = whisperReady && translatorReady

  if (!loading && allReady) return null
  if (!loading && !whisperLoading && !translatorLoading && !whisperReady && !translatorReady) return null

  const overallProgress = Math.round(
    ((whisperReady ? 100 : whisperProgress) + (translatorReady ? 100 : translatorProgress)) / 2
  )

  return (
    <div className="ai-progress-bar-container">
      <div className="ai-progress-track">
        <div
          className="ai-progress-fill"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
      <span className="ai-progress-text">
        {allReady
          ? 'AI ready for offline use'
          : `Loading AI models... ${overallProgress}%`}
      </span>
    </div>
  )
}

export default function App() {
  const { view, setView, setConnectionStatus } = useBridgeStore()

  const params = new URLSearchParams(window.location.search)
  const forcedView = params.get('view')
  const isEmbedded = !!forcedView

  useEffect(() => {
    if (forcedView && (forcedView === 'patient' || forcedView === 'doctor' || forcedView === 'relay')) {
      setView(forcedView)
    }
  }, [forcedView, setView])

  useEffect(() => {
    initAIWorkers()
  }, [])

  useEffect(() => {
    const client = getClient()

    const onConnect = () => setConnectionStatus('connected')
    const onOffline = () => setConnectionStatus('offline')
    const onReconnect = () => setConnectionStatus('connecting')

    client.on('connect', onConnect)
    client.on('offline', onOffline)
    client.on('reconnect', onReconnect)

    return () => {
      client.off('connect', onConnect)
      client.off('offline', onOffline)
      client.off('reconnect', onReconnect)
    }
  }, [setConnectionStatus])

  return (
    <div className={`app ${isEmbedded ? 'app-embedded' : ''}`}>
      <AIProgressBar />

      <main className="app-main">
        {view === 'patient' && <PatientView />}
        {view === 'relay' && <RelayView />}
        {view === 'doctor' && <DoctorView />}
      </main>

      {!isEmbedded && <QRExchange />}

      {!isEmbedded && (
        <nav className="app-nav">
          {VIEW_LABELS.map((v) => (
            <button
              key={v.key}
              className={`nav-btn ${view === v.key ? 'active' : ''}`}
              onClick={() => setView(v.key)}
            >
              <span className="nav-icon">{v.icon}</span>
              <span className="nav-label">{v.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
