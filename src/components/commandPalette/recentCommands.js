const STORAGE_KEY = 'sms.recent-commands'
const MAX_RECENT = 6

/**
 * Recently visited paths.
 *
 * Only the path is stored. Labels are resolved from the active navigation and
 * the active language at render time, so switching language never leaves a
 * stale label behind in storage.
 */
const readRecent = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter(
      (path) => typeof path === 'string' && path.length > 0,
    )
  } catch {
    return []
  }
}

export const getRecentPaths = () => readRecent()

export const recordRecentPath = (path) => {
  try {
    const next = readRecent().filter((item) => item !== path)
    next.unshift(path)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_RECENT)))
  } catch {
    // Storage may be unavailable or full. Recent tracking is best-effort only.
  }
}
