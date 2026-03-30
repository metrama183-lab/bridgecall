const STORAGE_KEY = 'bridgecall_device_id'

let overrideId = null

export function setDeviceIdOverride(id) {
  overrideId = id
}

export function getDeviceId() {
  if (overrideId) return overrideId

  const params = new URLSearchParams(window.location.search)
  const paramId = params.get('did')
  if (paramId) {
    overrideId = paramId
    return paramId
  }

  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}
