import { useEffect, useState } from 'react'
import siteEditorService from '@/services/siteEditorService'

/**
 * The open site's draft, read once for the assistant page.
 *
 * ── Why the assistant reads the editor's document ──────────────────────────────
 *
 * The context panel has to name what the user is asking about: "Home page", "Hero
 * section", not `p_9f2a`. The URL only carries identifiers, and an identifier is the
 * one thing a person should never have to read. The draft is the existing, already
 * normalised source for those names — pages, sections and blocks — so the assistant
 * reads it instead of asking the editor to publish names somewhere new.
 *
 * ── What it is not ─────────────────────────────────────────────────────────────
 *
 * It is not a second editor. Nothing here is written back, nothing is kept in sync
 * with an open editor tab, and no part of a proposal is validated against it. A
 * missing document — no backend, no draft yet — resolves to null and the panel falls
 * back to "not open", which is the honest answer when the names cannot be read.
 *
 * The read also supplies the draft's `updatedAt`, which is the only revision this
 * portal can compare a proposal against. It is used for exactly that comparison and
 * for nothing else.
 */
function useAiSiteDraft(siteId) {
  const [document, setDocument] = useState(null)
  const [loadError, setLoadError] = useState(null)

  /**
   * Which site the state on screen belongs to.
   *
   * Derived rather than stored as a boolean, so navigating to a different site cannot
   * briefly show the previous site's page names under the new heading — the same
   * derivation `useAiAssistant` uses for its transcript. While the key does not match,
   * `draft` reads as null rather than as someone else's document.
   */
  const [loadedFor, setLoadedFor] = useState(null)
  const requestKey = siteId ?? ''

  const isLoading = Boolean(siteId) && loadedFor !== requestKey
  const draft = loadedFor === requestKey ? document : null

  useEffect(() => {
    if (!siteId) return undefined

    let isActive = true

    siteEditorService
      .getSiteDraft(siteId)
      .then((next) => {
        if (!isActive) return
        setDocument(next)
        setLoadError(null)
      })
      .catch(() => {
        if (!isActive) return
        // A failed read is not an error card: the assistant still works without the
        // names, and a panel announcing a draft failure would be describing a problem
        // the user did not come here to solve. `loadError` records it for anything
        // that wants to know why a name is missing.
        setDocument(null)
        setLoadError('draft-unreadable')
      })
      .then(() => {
        if (isActive) setLoadedFor(siteId)
      })

    return () => {
      isActive = false
    }
  }, [siteId])

  return { draft, isLoading, loadError }
}

export default useAiSiteDraft
