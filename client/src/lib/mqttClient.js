import mqtt from 'mqtt'
import { getDeviceId } from './deviceId'

let client = null
const listeners = new Map()

function topicMatchesPattern(pattern, topic) {
  if (pattern === topic) return true
  const patternParts = pattern.split('/')
  const topicParts = topic.split('/')
  if (patternParts.length !== topicParts.length) return false
  return patternParts.every((p, i) => p === '+' || p === topicParts[i])
}

export function getClient() {
  if (client) return client

  client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', {
    clientId: `bridgecall_${getDeviceId()}`,
    clean: false,
    reconnectPeriod: 3000,
    connectTimeout: 30000,
    keepalive: 60,
    queueQoSZero: true
  })

  client.on('connect', () => {
    console.log('[MQTT] Connected to broker')
  })

  client.on('reconnect', () => {
    console.log('[MQTT] Reconnecting...')
  })

  client.on('error', (err) => {
    console.error('[MQTT] Error:', err.message)
  })

  client.on('message', (topic, msg) => {
    let parsed
    try {
      parsed = JSON.parse(msg.toString())
    } catch {
      console.error('[MQTT] Failed to parse message on', topic)
      return
    }

    for (const [pattern, callbacks] of listeners) {
      if (topicMatchesPattern(pattern, topic)) {
        callbacks.forEach((cb) => cb(parsed))
      }
    }
  })

  return client
}

export function publish(topic, payload) {
  const c = getClient()
  c.publish(topic, JSON.stringify(payload), { qos: 1, retain: false })
}

export function subscribe(topic, callback) {
  const c = getClient()
  c.subscribe(topic, { qos: 1 })

  if (!listeners.has(topic)) {
    listeners.set(topic, new Set())
  }
  listeners.get(topic).add(callback)

  return () => {
    const cbs = listeners.get(topic)
    if (cbs) {
      cbs.delete(callback)
      if (cbs.size === 0) {
        c.unsubscribe(topic)
        listeners.delete(topic)
      }
    }
  }
}

export function disconnect() {
  if (client) {
    client.end()
    client = null
    listeners.clear()
  }
}
