import { useBridgeStore } from '../../store/bridgeStore'

const SYMPTOMS = [
  { id: 'fever', icon: '🌡️', label: 'Fever' },
  { id: 'cough', icon: '🤧', label: 'Cough' },
  { id: 'pain', icon: '😣', label: 'Pain' },
  { id: 'nausea', icon: '🤢', label: 'Nausea' },
  { id: 'dizzy', icon: '😵‍💫', label: 'Dizzy' },
  { id: 'fatigue', icon: '😴', label: 'Fatigue' },
  { id: 'breathing', icon: '😮‍💨', label: 'Breathing' },
  { id: 'bleeding', icon: '🩸', label: 'Bleeding' },
  { id: 'rash', icon: '🔴', label: 'Rash' },
  { id: 'swelling', icon: '🫧', label: 'Swelling' },
  { id: 'vomiting', icon: '🤮', label: 'Vomiting' },
  { id: 'diarrhea', icon: '💧', label: 'Diarrhea' },
  { id: 'headache', icon: '🤕', label: 'Headache' },
  { id: 'burn', icon: '🔥', label: 'Burn' },
  { id: 'fracture', icon: '🦴', label: 'Fracture' },
  { id: 'pregnant', icon: '🤰', label: 'Pregnant' }
]

export default function SymptomsGrid() {
  const { selectedSymptoms, toggleSymptom } = useBridgeStore()

  return (
    <div className="symptoms-grid">
      <h3 className="symptoms-title">Select symptoms</h3>
      <div className="symptoms-items">
        {SYMPTOMS.map((s) => (
          <button
            key={s.id}
            className={`symptom-btn ${selectedSymptoms.includes(s.id) ? 'active' : ''}`}
            onClick={() => toggleSymptom(s.id)}
          >
            <span className="symptom-icon">{s.icon}</span>
            <span className="symptom-label">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
