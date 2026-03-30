import { pipeline } from '@xenova/transformers'

let translator = null

async function loadModel() {
  self.postMessage({ type: 'status', message: 'Loading translation model...' })

  translator = await pipeline(
    'translation',
    'Xenova/m2m100_418M',
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

  if (data.type === 'translate') {
    if (!translator) {
      self.postMessage({ type: 'error', message: 'Model not loaded' })
      return
    }

    try {
      self.postMessage({ type: 'status', message: 'Translating...' })

      const result = await translator(data.text, {
        src_lang: data.srcLang || 'en',
        tgt_lang: data.tgtLang || 'en'
      })

      self.postMessage({
        type: 'result',
        translatedText: result[0]?.translation_text || '',
        srcLang: data.srcLang,
        tgtLang: data.tgtLang
      })
    } catch (err) {
      self.postMessage({ type: 'error', message: err.message })
    }
  }
}
