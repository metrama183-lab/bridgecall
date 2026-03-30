import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import messagesRouter from './routes/messages.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/messages', messagesRouter)

app.listen(PORT, () => {
  console.log(`[BridgeCall Server] Running on port ${PORT}`)
})
