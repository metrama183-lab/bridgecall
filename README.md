# BridgeCall — Medical Communication for Zero-Connectivity Zones

## The Problem

800 million people live beyond the reach of reliable internet.
When they get sick, the nearest doctor is hours away.
WhatsApp doesn't work without internet. Neither does anything else.

## Our Solution

BridgeCall uses **any available channel** — 2G, mesh P2P, WiFi Direct —
to carry medical voice messages from patient to doctor.
Every phone becomes a relay node. The message finds its own path.

**No registration. No cloud processing. No literacy required.**

## Architecture

```
Patient Phone                    Relay Phone                   Doctor Phone
┌─────────────┐                 ┌─────────────┐              ┌─────────────┐
│ Record Voice │                │             │              │ Receive Msg │
│      ↓       │   QR / P2P    │  Store &    │   2G / MQTT  │      ↓      │
│ Whisper WASM │ ──────────→   │  Forward    │ ──────────→  │ Transcript  │
│      ↓       │  WebRTC DC    │             │              │ + Audio     │
│ M2M-100 WASM │                │             │              │      ↓      │
│      ↓       │                └─────────────┘              │ Respond     │
│ MQTT / P2P   │                                             │      ↓      │
│      ↓       │                                             │ ACK → Patient│
│ ✅ or ⏳     │  ←──────────────────────────────────────────│ (seen conf.)│
└─────────────┘                                              └─────────────┘
```

### Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Vite PWA | Offline-first with Service Worker |
| Styling | Vanilla CSS | Zero dependencies, minimal bundle |
| Protocol | MQTT.js over WebSockets | 2-byte header, QoS native, resilient on 2G |
| Broker | HiveMQ (session-scoped topics) | Scoped topic prefix prevents cross-session leaks |
| AI Transcription | Whisper Tiny WASM (Transformers.js) | On-device, zero bandwidth, zero privacy issues |
| AI Translation | M2M-100 418M via Transformers.js | On-device, 100 languages, zero cloud |
| Local Database | RxDB + IndexedDB (schema ready) | Offline-first, auto sync, conflict resolution |
| P2P Offline | WebRTC Data Channel + QR bootstrap | Zero server for local mesh |
| Audio | Opus via MediaRecorder | Native browser, 16kHz mono ~50KB/min |
| Cloud Storage | Cloudflare R2 (WEUR) | Zero egress fees, GDPR compliant |
| Backend | Node.js + Express on Railway | Minimal mailbox, not critical logic |

## Why This Architecture

- **MQTT over WebSocket**: 2-byte headers vs 6+ for WebSocket raw. Built-in QoS guarantees delivery even on 9.6kbps EDGE networks. Session-scoped topic prefix (`bridgecall/{sessionId}/`) prevents unauthorized access.
- **Edge AI**: Whisper Tiny runs entirely on-device via WASM. No audio ever leaves the patient's phone. Models auto-load on app open — no user action needed. Full UN OCHA Data Responsibility compliance.
- **RxDB Local-First**: Works completely offline. Syncs automatically when any connection appears.
- **WebRTC P2P**: Patient and relay exchange data via QR code SDP. Zero server required for local mesh communication. Manual SDP paste fallback for browsers without BarcodeDetector.
- **Delivery confirmation**: Doctor sends MQTT ACK when message is opened. Patient sees real status: "Sent to relay" vs "Doctor received" — no false positives.

## Data Flow

### Scenario A — 2G Available

```
Patient speaks → AudioManager records (16kHz mono Opus)
→ Whisper WASM transcribes ON-DEVICE (auto-loaded at startup)
→ M2M-100 translates ON-DEVICE (with graceful fallback)
→ Anonymous UUID + fuzzy GPS (~1km) attached
→ MQTT QoS 1 → scoped topic → HiveMQ → Doctor
→ Doctor opens message → ACK sent back to patient
→ Patient sees "Doctor received ✅"
→ Doctor responds vocally (same pipeline, reverse)
```

### Scenario B — Zero Connection (P2P Mesh)

```
Patient opens QR Exchange → chooses "I'm the Patient"
→ WebRTC generates SDP offer → displayed as QR
→ Relay scans QR (or pastes manually) → connection established
→ Messages sync via DataChannel, zero server, zero internet
→ Patient sees "Sent to relay 📨"
→ When relay finds 2G → presses "Send" → MQTT delivers all queued
→ Doctor ACK propagates back
```

## Privacy & UN Compliance

- **Zero cloud AI processing** — all transcription/translation runs on-device via WASM
- **Anonymous UUID** — no registration, no phone number, no email
- **Fuzzy GPS** — 1km precision only (rounded to 2 decimal places)
- **Session-scoped MQTT topics** — messages isolated per deployment, not globally visible
- **GDPR-compliant storage** — Cloudflare R2, WEUR region, zero egress fees
- **Aligned with UN OCHA Data Responsibility Guidelines 2025**
- **No health data persisted on relay devices** — relay only forwards, never stores

## Important: First Launch Requirement

AI models (Whisper Tiny ~40MB, M2M-100 ~200MB) are downloaded from HuggingFace on first app launch and cached by the Service Worker. **First launch requires internet connectivity.** After that, everything works fully offline. For the hackathon demo, pre-load the app once before presenting.

## Quick Start

```bash
# Client
cd client
npm install
npm run dev
# Open http://localhost:5173 — models will auto-download

# Server (optional, for cloud relay)
cd server
npm install
cp .env.example .env
npm run dev
```

### Demo Testing

1. Open two browser tabs (or two devices on same network)
2. Tab 1: Stay on **Patient** view — record a voice message, select symptoms
3. Tab 2: Switch to **Doctor** view — message appears automatically via MQTT
4. Doctor opens message → Patient tab shows "Doctor received ✅"

## What's Implemented (Prototype)

- [x] Whisper WASM on-device transcription — auto-loads at startup, no user action
- [x] M2M-100 on-device translation — 100 languages, graceful fallback on failure
- [x] MQTT QoS 1 resilient messaging — survives 2G, session-scoped topics
- [x] Doctor ACK confirmation — patient knows when doctor actually received
- [x] RxDB IndexedDB schema defined (persistence wiring in roadmap)
- [x] WebRTC P2P via QR code — zero-server mesh with manual paste fallback
- [x] Fuzzy GPS privacy layer (~1km)
- [x] Anonymous UUID — zero registration
- [x] PWA installable — works offline after first load
- [x] Visual symptom selection — icon-based, zero text literacy required
- [x] Full body map pain localization — 10 anatomical zones
- [x] 11 language options including Arabic, Swahili, Bengali, Hindi

## Production Roadmap

- [ ] **E2E encryption**: AES-256-GCM for all health data in transit
- [ ] **Protobuf serialization**: 80% payload reduction over JSON
- [ ] **Codec2 WASM**: Audio at 700bps (5KB/min vs 50KB/min)
- [ ] **Background Sync API**: Automatic sync without screen on
- [ ] **Multi-hop relay**: Chain of relay nodes for extended range
- [ ] **SMS fallback**: Compressed data via SMS when zero data connectivity
- [ ] **HiveMQ Cloud dedicated**: Private broker with TLS + auth
- [ ] **Model pre-bundling**: Ship Whisper Tiny inside the PWA bundle

## Team

Built for the UN Hackathon — Geneva 2026

## License

MIT
