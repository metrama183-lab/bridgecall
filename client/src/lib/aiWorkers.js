import { useBridgeStore } from '../store/bridgeStore'

let whisperWorker = null
let translateWorker = null

export function getWhisperWorker() {
  return whisperWorker
}

export function getTranslateWorker() {
  return translateWorker
}

export function initAIWorkers() {
  const store = useBridgeStore.getState()

  if (!whisperWorker) {
    whisperWorker = new Worker(
      new URL('./whisperWorker.js', import.meta.url),
      { type: 'module' }
    )
    whisperWorker.onmessage = ({ data }) => {
      const s = useBridgeStore.getState()
      if (data.type === 'ready') {
        s.setWhisperReady(true)
        s.setWhisperLoading(false)
        s.setWhisperProgress(100)
      }
      if (data.type === 'progress' && data.progress != null) {
        s.setWhisperProgress(Math.round(data.progress))
      }
      if (data.type === 'error') {
        s.setWhisperLoading(false)
        console.error('[Whisper]', data.message)
      }
    }
  }

  if (!translateWorker) {
    translateWorker = new Worker(
      new URL('./translateWorker.js', import.meta.url),
      { type: 'module' }
    )
    translateWorker.onmessage = ({ data }) => {
      const s = useBridgeStore.getState()
      if (data.type === 'ready') {
        s.setTranslatorReady(true)
        s.setTranslatorLoading(false)
        s.setTranslatorProgress(100)
      }
      if (data.type === 'progress' && data.progress != null) {
        s.setTranslatorProgress(Math.round(data.progress))
      }
      if (data.type === 'error') {
        s.setTranslatorLoading(false)
        console.error('[Translator]', data.message)
      }
    }
  }

  if (!store.whisperReady && !store.whisperLoading) {
    store.setWhisperLoading(true)
    whisperWorker.postMessage({ type: 'load' })
  }

  if (!store.translatorReady && !store.translatorLoading) {
    store.setTranslatorLoading(true)
    translateWorker.postMessage({ type: 'load' })
  }
}
