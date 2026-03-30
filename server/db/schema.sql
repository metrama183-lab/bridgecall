CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL,
    doctor_id UUID,
    direction VARCHAR(20) NOT NULL DEFAULT 'patient-to-doctor',
    audio_key TEXT,
    transcript_original TEXT,
    transcript_translated TEXT,
    language_detected VARCHAR(10),
    lat_fuzzy DECIMAL(5,2),
    lng_fuzzy DECIMAL(5,2),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    hop_count INTEGER DEFAULT 0,
    symptoms TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_patient ON messages(patient_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
