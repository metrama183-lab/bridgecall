import { WebRTCManager } from './webrtcManager'
import { useBridgeStore } from '../store/bridgeStore'

let instance = null

export function getP2PManager() {
  if (!instance) {
    instance = new WebRTCManager()

    instance.onStateChange = (state) => {
      useBridgeStore.getState().setP2PStatus(state)
    }

    instance.onData = (data) => {
      if (data.id && data.patientId) {
        useBridgeStore.getState().addToRelayQueue(data)
      }
    }
  }
  return instance
}

export function sendViaP2P(msg) {
  const mgr = getP2PManager()
  return mgr.send(msg)
}

export function isP2PConnected() {
  return useBridgeStore.getState().p2pStatus === 'connected'
}
