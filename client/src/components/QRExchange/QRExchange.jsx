import { useState } from 'react'
import { getP2PManager } from '../../lib/p2pManager'
import QRDisplay from './QRDisplay'
import QRScanner from './QRScanner'

export default function QRExchange() {
  const [step, setStep] = useState('idle')
  const [sdp, setSdp] = useState('')

  const startAsOfferer = async () => {
    setStep('offering')
    const rtc = getP2PManager()
    const offer = await rtc.createOffer()
    setSdp(offer)
    setStep('show-offer')
  }

  const handleAnswerScanned = async (answer) => {
    const rtc = getP2PManager()
    await rtc.acceptAnswer(answer)
    setStep('connected')
  }

  const startAsAnswerer = () => {
    setStep('scan-offer')
  }

  const handleOfferScanned = async (offer) => {
    setStep('answering')
    const rtc = getP2PManager()
    const answer = await rtc.acceptOffer(offer)
    setSdp(answer)
    setStep('show-answer')
  }

  return (
    <div className="qr-exchange">
      <h3 className="qr-title">P2P Connection</h3>

      {step === 'idle' && (
        <div className="qr-role-select">
          <button className="qr-role-btn patient" onClick={startAsOfferer}>
            <span className="qr-role-icon">🏥</span>
            <span>I'm the Patient</span>
            <span className="qr-role-sub">Generate connection QR</span>
          </button>
          <button className="qr-role-btn relay" onClick={startAsAnswerer}>
            <span className="qr-role-icon">📡</span>
            <span>I'm a Relay</span>
            <span className="qr-role-sub">Scan patient's QR</span>
          </button>
        </div>
      )}

      {step === 'show-offer' && (
        <div className="qr-step">
          <QRDisplay data={sdp} label="Show this to the relay" />
          <p className="qr-instruction">After relay scans, scan their QR:</p>
          <QRScanner onScan={handleAnswerScanned} />
        </div>
      )}

      {step === 'scan-offer' && (
        <div className="qr-step">
          <p className="qr-instruction">Scan the patient's QR code:</p>
          <QRScanner onScan={handleOfferScanned} />
        </div>
      )}

      {step === 'show-answer' && (
        <div className="qr-step">
          <QRDisplay data={sdp} label="Show this to the patient" />
          <p className="qr-instruction">Waiting for connection...</p>
        </div>
      )}

      {step === 'connected' && (
        <div className="qr-connected">
          <span className="qr-connected-icon">✅</span>
          <p>P2P Connected!</p>
          <p className="qr-connected-sub">Messages will sync automatically</p>
        </div>
      )}
    </div>
  )
}
