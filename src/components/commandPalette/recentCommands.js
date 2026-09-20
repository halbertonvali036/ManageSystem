const STORAGE_KEY = 'managesystem-recent-commands'
const MAX_RECENT = 6

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
      (item) =>
        item &&
        typeof item.label === 'string' &&
        typeof item.path === 'string',
    )
  } catch {
    return []
  }
}

export const getRecentCommands = () => readRecent()

export const recordRecentCommand = (path, label) => {
  try {
    const next = readRecent().filter((item) => item.path !== path)
    next.unshift({ path, label })
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next.slice(0, MAX_RECENT)),
    )
  } catch {
    // Storage may be unavailable or full. Recent tracking is best-effort only.
  }
}