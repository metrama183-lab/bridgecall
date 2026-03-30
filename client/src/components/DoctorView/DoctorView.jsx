import { useState, useEffect, useCallback } from 'react'
import { useBridgeStore } from '../../store/bridgeStore'
import { subscribe, publish } from '../../lib/mqttClient'
import { topic } from '../../lib/topicPrefix'
import MessageList from './MessageList'
import TranscriptPanel from './TranscriptPanel'
import AudioPlayer from './AudioPlayer'
import ResponseRecorder from './ResponseRecorder'

export default function DoctorView() {
  const [selected, setSelected] = useState(null)
  const { addMessage, connectionStatus } = useBridgeStore()

  useEffect(() => {
    const unsub = subscribe(topic('messages/+'), (msg) => {
      addMessage(msg)

      if (msg.patientId && msg.id) {
        publish(topic(`ack/${msg.patientId}`), {
          messageId: msg.id,
          status: 'seen',
          timestamp: new Date().toISOString()
        })
      }
    })
    return unsub
  }, [addMessage])

  const handleSelect = useCallback((msg) => {
    setSelected(msg)
  }, [])

  return (
    <div className="doctor-view">
      <header className="doctor-header">
        <div className={`connection-dot ${connectionStatus}`} />
        <h2>Doctor Dashboard</h2>
      </header>

      <div className="doctor-layout">
        <aside className="doctor-sidebar">
          <MessageList onSelect={handleSelect} selectedId={selected?.id} />
        </aside>

        <main className="doctor-main">
          <TranscriptPanel message={selected} />
          {selected && <AudioPlayer audioBase64={selected.audioBase64} />}
          <ResponseRecorder patientMessage={selected} />
        </main>
      </div>
    </div>
  )
}
