import { useState, useRef, useEffect } from 'react'

export default function QRScanner({ onScan }) {
  const [scanning, setScanning] = useState(false)
  const [noBarcodeApi, setNoBarcodeApi] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const scanningRef = useRef(false)

  useEffect(() => {
    return () => {
      scanningRef.current = false
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setScanning(true)
      scanningRef.current = true

      if ('BarcodeDetector' in window) {
        const detector = new BarcodeDetector({ formats: ['qr_code'] })
        const detect = async () => {
          if (!videoRef.current || !scanningRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes.length > 0) {
              onScan?.(codes[0].rawValue)
              stopScan()
              return
            }
          } catch { /* frame not ready */ }
          requestAnimationFrame(detect)
        }
        detect()
      } else {
        setNoBarcodeApi(true)
      }
    } catch (err) {
      console.error('Camera access denied:', err)
    }
  }

  const stopScan = () => {
    scanningRef.current = false
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setScanning(false)
  }

  const handleManualInput = () => {
    const text = prompt('Paste SDP data:')
    if (text) onScan?.(text)
  }

  return (
    <div className="qr-scanner">
      {scanning ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="qr-video"
          />
          {noBarcodeApi && (
            <p className="qr-no-api-msg">
              Auto-scan not supported on this browser. Use paste instead.
            </p>
          )}
          <div className="qr-scanner-actions">
            <button className="qr-manual-btn" onClick={handleManualInput}>
              📋 Paste Manually
            </button>
            <button className="qr-stop-btn" onClick={stopScan}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div className="qr-scanner-actions">
          <button className="qr-scan-btn" onClick={startScan}>
            📷 Scan QR Code
          </button>
          <button className="qr-manual-btn" onClick={handleManualInput}>
            📋 Paste Manually
          </button>
        </div>
      )}
    </div>
  )
}
