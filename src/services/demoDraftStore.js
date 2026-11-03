/**
 * Session-scoped draft memory for the local editor demo.
 *
 * This is not a backend and not a fake site: it only keeps a draft that the user
 * just created in this browser tab, so the local editor can reopen the same
 * working state after the wizard navigates away. Nothing is written to the API
 * and nothing survives a full reload of the tab.
 */
const drafts = new Map()

export const rememberDemoDraft = (siteId, draft) => {
  if (!siteId || !draft) {
    return
  }
  drafts.set(siteId, draft)
}

export const getRememberedDemoDraft = (siteId) => (siteId ? drafts.get(siteId) ?? null : null)

export const forgetDemoDraft = (siteId) => {
  if (siteId) {
    drafts.delete(siteId)
  }
}
