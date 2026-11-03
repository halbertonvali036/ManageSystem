/**
 * One-shot seed memory for a just-created project.
 *
 * When the create flow cannot persist the initial draft, the document waits in
 * sessionStorage under the site's id. The editor consumes it once when the
 * server reports that the project has no draft, so the visitor still opens on
 * their personalised content instead of an empty template. It is deliberately
 * session-scoped: nothing survives the tab and nothing pretends to be saved.
 */
const KEY_PREFIX = 'managesystem-pending-draft-seed:'

const getStorage = () => {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null
  } catch {
    return null
  }
}

const keyFor = (siteId) => `${KEY_PREFIX}${siteId}`

export const rememberPendingDraftSeed = (siteId, document) => {
  if (!siteId || !document) {
    return
  }
  try {
    getStorage()?.setItem(keyFor(siteId), JSON.stringify(document))
  } catch {
    // Storage can be full or disabled; the editor simply opens without the seed.
  }
}

const readAndRemove = (siteId, remove) => {
  if (!siteId) {
    return null
  }
  const storage = getStorage()
  if (!storage) {
    return null
  }
  try {
    const raw = storage.getItem(keyFor(siteId))
    if (!raw) {
      return null
    }
    if (remove) {
      storage.removeItem(keyFor(siteId))
    }
    const document = JSON.parse(raw)
    return document && typeof document === 'object' && Array.isArray(document.pages)
      ? document
      : null
  } catch {
    return null
  }
}

/** Reads the pending seed and removes it in the same step. */
export const takePendingDraftSeed = (siteId) => readAndRemove(siteId, true)

/** Drops a pending seed that is no longer needed, such as when the server has a draft. */
export const forgetPendingDraftSeed = (siteId) => {
  if (!siteId) {
    return
  }
  try {
    getStorage()?.removeItem(keyFor(siteId))
  } catch {
    // Nothing to clean up when storage is unavailable.
  }
}

/** Reads without removing; useful for diagnostics and tests. */
export const peekPendingDraftSeed = (siteId) => readAndRemove(siteId, false)
