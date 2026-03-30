import { pipeline } from '@xenova/transformers'

let transcriber = null

async function loadModel() {
  self.postMessage({ type: 'status', message: 'Loading Whisper model...' })

  transcriber = await pipeline(
    'automatic-speech-recognition',
    'Xenova/whisper-tiny',
    {
      quantized: true,
      progress_callback: (progress) => {
        self.postMessage({ type: 'progress', ...progress })
      }
    }
  )

  self.postMessage({ type: 'ready' })
}

self.onmessage = async ({ data }) => {
  if (data.type === 'load') {
    try {
      await loadModel()
    } catch (err) {
      self.postMessage({ type: 'error', message: err.message })
    }
  }

  if (data.type === 'transcribe') {
    if (!transcriber) {
      self.postMessage({ type: 'error', message: 'Model not loaded' })
      return
    }

    try {
      self.postMessage({ type: 'status', message: 'Transcribing...' })

      const result = await transcriber(data.audio, {
        language: data.language || null,
        task: 'transcribe',
        chunk_length_s: 30,
        stride_length_s: 5
      })

      self.postMessage({
        type: 'result',
        text: result.text,
        chunks: result.chunks || []
      })
    } catch (err) {
      self.postMessage({ type: 'error', message: err.message })
    }
  }
}
