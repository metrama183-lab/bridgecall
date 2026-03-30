export class AudioManager {
  constructor() {
    this.mediaRecorder = null
    this.chunks = []
    this.stream = null
    this.audioContext = null
  }

  async startRecording() {
    this.chunks = []
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      }
    })

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType,
      audioBitsPerSecond: 16000
    })

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data)
    }

    this.mediaRecorder.start(1000)
  }

  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null)
        return
      }

      this.mediaRecorder.onstop = async () => {
        const blob = new Blob(this.chunks, { type: this.mediaRecorder.mimeType })

        this.stream?.getTracks().forEach((t) => t.stop())
        this.stream = null
        this.chunks = []

        resolve(blob)
      }

      this.mediaRecorder.stop()
    })
  }

  isRecording() {
    return this.mediaRecorder?.state === 'recording'
  }

  static async blobToFloat32(blob) {
    const arrayBuffer = await blob.arrayBuffer()
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 16000
    })
    const decoded = await audioCtx.decodeAudioData(arrayBuffer)
    const float32 = decoded.getChannelData(0)
    audioCtx.close()
    return float32
  }

  static async blobToBase64(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result.split(',')[1])
      reader.readAsDataURL(blob)
    })
  }

  static base64ToBlob(base64, mimeType = 'audio/webm;codecs=opus') {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new Blob([bytes], { type: mimeType })
  }
}
