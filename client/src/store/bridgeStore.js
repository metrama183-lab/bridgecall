import { create } from 'zustand'

export const useBridgeStore = create((set, get) => ({
  view: 'patient',
  setView: (view) => set({ view }),

  // Connection
  connectionStatus: 'offline',
  setConnectionStatus: (s) => set({ connectionStatus: s }),

  // AI models
  whisperReady: false,
  translatorReady: false,
  whisperLoading: false,
  translatorLoading: false,
  whisperProgress: 0,
  translatorProgress: 0,
  setWhisperReady: (v) => set({ whisperReady: v }),
  setTranslatorReady: (v) => set({ translatorReady: v }),
  setWhisperLoading: (v) => set({ whisperLoading: v }),
  setTranslatorLoading: (v) => set({ translatorLoading: v }),
  setWhisperProgress: (v) => set({ whisperProgress: v }),
  setTranslatorProgress: (v) => set({ translatorProgress: v }),

  // Recording
  isRecording: false,
  setIsRecording: (v) => set({ isRecording: v }),

  // Patient language
  patientLanguage: 'auto',
  doctorLanguage: 'en',
  setPatientLanguage: (l) => set({ patientLanguage: l }),
  setDoctorLanguage: (l) => set({ doctorLanguage: l }),

  // Messages
  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateMessage: (id, updates) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...updates } : m))
    })),

  // Symptoms
  selectedSymptoms: [],
  toggleSymptom: (symptom) =>
    set((s) => ({
      selectedSymptoms: s.selectedSymptoms.includes(symptom)
        ? s.selectedSymptoms.filter((sy) => sy !== symptom)
        : [...s.selectedSymptoms, symptom]
    })),
  clearSymptoms: () => set({ selectedSymptoms: [] }),

  // P2P
  p2pStatus: 'disconnected',
  setP2PStatus: (s) => set({ p2pStatus: s }),

  // Relay queue
  relayQueue: [],
  addToRelayQueue: (msg) => set((s) => ({ relayQueue: [...s.relayQueue, msg] })),
  removeFromRelayQueue: (id) =>
    set((s) => ({ relayQueue: s.relayQueue.filter((m) => m.id !== id) })),

  // Processing state
  processingStage: null,
  setProcessingStage: (stage) => set({ processingStage: stage })
}))
