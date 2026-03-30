export default function TranscriptPanel({ message }) {
  if (!message) {
    return (
      <div className="transcript-panel-empty">
        <p>Select a message to view details</p>
      </div>
    )
  }

  return (
    <div className="transcript-panel">
      <div className="transcript-section">
        <h4 className="transcript-heading">
          <span className="transcript-icon">🎙️</span>
          Original Transcript
          {message.languageDetected && (
            <span className="lang-badge">{message.languageDetected}</span>
          )}
        </h4>
        <p className="transcript-text">
          {message.transcriptOriginal || 'No transcript available — audio only'}
        </p>
      </div>

      {message.transcriptTranslated && (
        <div className="transcript-section translated">
          <h4 className="transcript-heading">
            <span className="transcript-icon">🌍</span>
            English Translation
          </h4>
          <p className="transcript-text">{message.transcriptTranslated}</p>
        </div>
      )}

      {message.symptoms?.length > 0 && (
        <div className="transcript-section">
          <h4 className="transcript-heading">
            <span className="transcript-icon">🩺</span>
            Reported Symptoms
          </h4>
          <div className="symptoms-tags">
            {message.symptoms.map((s) => (
              <span key={s} className="symptom-tag">{s}</span>
            ))}
          </div>
        </div>
      )}

      {(message.latFuzzy || message.lngFuzzy) && (
        <div className="transcript-section">
          <h4 className="transcript-heading">
            <span className="transcript-icon">📍</span>
            Approximate Location
          </h4>
          <p className="transcript-text">
            {message.latFuzzy}°, {message.lngFuzzy}° (~1km radius)
          </p>
        </div>
      )}

      <div className="transcript-meta">
        <span>Hops: {message.hopCount || 0}</span>
        <span>ID: {message.id.slice(0, 8)}</span>
      </div>
    </div>
  )
}
