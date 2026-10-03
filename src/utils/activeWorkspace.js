export const ACTIVE_WORKSPACE_STORAGE_KEY = 'sms.activeWorkspace'

/**
 * Reads the workspace id out of a path.
 *
 * `/workspaces/acme/sites` yields `acme`; anything outside the workspace tree
 * yields null. `workspaces/new` is a create form, not a workspace, so it is
 * deliberately excluded — treating it as a workspace id would put a "new" id
 * into every workspace-scoped navigation link.
 */
export function readWorkspaceIdFromPath(pathname) {
  const match = /^\/workspaces\/([^/]+)/.exec(pathname ?? '')
  const workspaceId = match?.[1]
  return workspaceId && workspaceId !== 'new' ? workspaceId : null
}

/**
 * The workspace the sidebar's product navigation points at.
 *
 * Most product destinations only exist inside a workspace, so the sidebar needs
 * one to build their links. The current URL wins; otherwise the last workspace
 * the person actually opened is reused, so the navigation does not collapse to
 * two entries every time they step back out to the workspace list.
 *
 * Remembering an id is only a UI hint. Nothing here grants access: every route
 * below it authorises on the server, and a stale id simply renders links that
 * the backend will refuse.
 */
export function readActiveWorkspaceId(pathname) {
  return readWorkspaceIdFromPath(pathname) ?? readStoredWorkspaceId()
}

export function readStoredWorkspaceId() {
  try {
    const stored = window.localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)
    return stored && stored !== 'new' ? stored : null
  } catch {
    return null
  }
}

export function persistActiveWorkspaceId(workspaceId) {
  try {
    if (workspaceId) {
      window.localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspaceId)
    }
  } catch {
    /* storage unavailable — the current URL is still the source of truth */
  }
}