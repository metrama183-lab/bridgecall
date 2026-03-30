import { Router } from 'express'
import { uploadAudio, getAudioUrl } from '../services/storageService.js'

const router = Router()

const messages = []

router.post('/', async (req, res) => {
  try {
    const msg = req.body

    if (!msg.id || !msg.patientId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (msg.audioBase64) {
      try {
        const audioKey = await uploadAudio(msg.id, msg.audioBase64)
        msg.audioKey = audioKey
        delete msg.audioBase64
      } catch {
        // R2 not configured — keep base64 in-memory for hackathon demo
      }
    }

    msg.receivedAt = new Date().toISOString()
    messages.push(msg)

    res.status(201).json({ id: msg.id, status: 'stored' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/', (_req, res) => {
  res.json(messages.map((m) => ({ ...m, audioBase64: undefined })))
})

router.get('/:id', (req, res) => {
  const msg = messages.find((m) => m.id === req.params.id)
  if (!msg) return res.status(404).json({ error: 'Not found' })

  if (msg.audioKey) {
    msg.audioUrl = getAudioUrl(msg.audioKey)
  }

  res.json(msg)
})

router.get('/patient/:patientId', (req, res) => {
  const patientMsgs = messages.filter((m) => m.patientId === req.params.patientId)
  res.json(patientMsgs)
})

export default router
