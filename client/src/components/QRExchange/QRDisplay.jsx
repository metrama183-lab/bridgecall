import { QRCodeSVG } from 'qrcode.react'

export default function QRDisplay({ data, label }) {
  if (!data) return null

  const truncated = data.length > 2000

  return (
    <div className="qr-display">
      <QRCodeSVG
        value={data}
        size={256}
        level="L"
        bgColor="transparent"
        fgColor="currentColor"
      />
      <p className="qr-label">{label || 'Scan this QR code'}</p>
      {truncated && (
        <p className="qr-warning">
          SDP data is large — hold phone steady
        </p>
      )}
    </div>
  )
}
