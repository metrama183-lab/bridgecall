import { useBridgeStore } from '../../store/bridgeStore'

const BODY_ZONES = [
  { id: 'head', label: '🧠', x: 50, y: 5, name: 'Head' },
  { id: 'throat', label: '🫁', x: 50, y: 15, name: 'Throat' },
  { id: 'chest', label: '❤️', x: 50, y: 26, name: 'Chest' },
  { id: 'left-arm', label: '💪', x: 18, y: 30, name: 'Left Arm' },
  { id: 'right-arm', label: '💪', x: 82, y: 30, name: 'Right Arm' },
  { id: 'stomach', label: '🤢', x: 50, y: 37, name: 'Stomach' },
  { id: 'abdomen', label: '🫃', x: 50, y: 48, name: 'Abdomen' },
  { id: 'left-leg', label: '🦵', x: 36, y: 68, name: 'Left Leg' },
  { id: 'right-leg', label: '🦵', x: 64, y: 68, name: 'Right Leg' },
  { id: 'feet', label: '🦶', x: 50, y: 90, name: 'Feet' }
]

export default function BodyMap() {
  const { selectedSymptoms, toggleSymptom } = useBridgeStore()

  const count = selectedSymptoms.filter((s) =>
    BODY_ZONES.some((z) => z.id === s)
  ).length

  return (
    <div className="body-map">
      <h3 className="body-map-title">
        Where does it hurt?
        {count > 0 && <span className="body-map-count">{count} selected</span>}
      </h3>
      <div className="body-map-container">
        <div className="body-silhouette">
          <svg viewBox="0 0 100 200" className="body-svg">
            <circle cx="50" cy="16" r="10" />
            <rect x="46" y="26" width="8" height="6" rx="2" />
            <path d="M34 32 L34 82 Q34 92 42 92 L58 92 Q66 92 66 82 L66 32 Q66 30 60 30 L40 30 Q34 30 34 32Z" />
            <path d="M34 34 L22 58 L18 78 L24 78 L28 60 L34 48Z" />
            <path d="M66 34 L78 58 L82 78 L76 78 L72 60 L66 48Z" />
            <path d="M40 92 L37 130 L33 170 L42 170 L44 132 L46 92Z" />
            <path d="M54 92 L56 132 L58 170 L67 170 L63 130 L60 92Z" />
            <ellipse cx="37" cy="177" rx="7" ry="4" />
            <ellipse cx="63" cy="177" rx="7" ry="4" />
          </svg>
        </div>

        {BODY_ZONES.map((zone) => (
          <button
            key={zone.id}
            className={`body-zone-btn ${selectedSymptoms.includes(zone.id) ? 'active' : ''}`}
            style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
            onClick={() => toggleSymptom(zone.id)}
            aria-label={zone.name}
          >
            <span className="body-zone-emoji">{zone.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
