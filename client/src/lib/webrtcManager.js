const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
]

export class WebRTCManager {
  constructor() {
    this.pc = null
    this.dataChannel = null
    this.onData = null
    this.onStateChange = null
  }

  async createOffer() {
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    this.dataChannel = this.pc.createDataChannel('bridgecall', {
      ordered: true
    })

    this._setupDataChannel(this.dataChannel)
    this._setupConnectionEvents()

    const offer = await this.pc.createOffer()
    await this.pc.setLocalDescription(offer)

    await this._waitForIceCandidates()
    return JSON.stringify(this.pc.localDescription)
  }

  async acceptOffer(offerSDP) {
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    this.pc.ondatachannel = (e) => {
      this.dataChannel = e.channel
      this._setupDataChannel(this.dataChannel)
    }

    this._setupConnectionEvents()

    const offer = JSON.parse(offerSDP)
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer))

    const answer = await this.pc.createAnswer()
    await this.pc.setLocalDescription(answer)

    await this._waitForIceCandidates()
    return JSON.stringify(this.pc.localDescription)
  }

  async acceptAnswer(answerSDP) {
    const answer = JSON.parse(answerSDP)
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer))
  }

  send(data) {
    if (this.dataChannel?.readyState === 'open') {
      const payload = typeof data === 'string' ? data : JSON.stringify(data)
      this.dataChannel.send(payload)
      return true
    }
    return false
  }

  close() {
    this.dataChannel?.close()
    this.pc?.close()
    this.pc = null
    this.dataChannel = null
  }

  _setupDataChannel(channel) {
    channel.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data)
        this.onData?.(parsed)
      } catch {
        this.onData?.(e.data)
      }
    }

    channel.onopen = () => this.onStateChange?.('connected')
    channel.onclose = () => this.onStateChange?.('disconnected')
    channel.onerror = () => this.onStateChange?.('error')
  }

  _setupConnectionEvents() {
    this.pc.oniceconnectionstatechange = () => {
      this.onStateChange?.(this.pc.iceConnectionState)
    }
  }

  _waitForIceCandidates() {
    return new Promise((resolve) => {
      if (this.pc.iceGatheringState === 'complete') {
        resolve()
        return
      }
      const check = () => {
        if (this.pc.iceGatheringState === 'complete') {
          this.pc.removeEventListener('icegatheringstatechange', check)
          resolve()
        }
      }
      this.pc.addEventListener('icegatheringstatechange', check)
      setTimeout(resolve, 5000)
    })
  }
}
