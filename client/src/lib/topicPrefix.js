const STORAGE_KEY = 'bridgecall_session'
const HARDCODED_DEMO = 'unhack2026'

export function getSessionId() {
  let session = localStorage.getItem(STORAGE_KEY)
  if (!session) {
    session = HARDCODED_DEMO
    localStorage.setItem(STORAGE_KEY, session)
  }
  return session
}

export function topic(path) {
  return `bridgecall/${getSessionId()}/${path}`
}
