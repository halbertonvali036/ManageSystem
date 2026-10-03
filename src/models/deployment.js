/**
 * Deployment model — one published build of a site.
 *
 * ── What a deployment is here ────────────────────────────────────────────────
 *
 * A deployment row is a *record the backend owns*. It describes one attempt to
 * publish a version of a site: when it was requested, what it reached, and where it
 * ended up. This file does not build, publish, or roll anything back.
 *
 * Rules enforced by this file:
 * - A deployment exists only when the backend sent one. There is no seeded "draft"
 *   row to make the page look used, and a deploy request never produces a local
 *   optimistic row: nothing here can report a build that did not run.
 * - The state is read from the backend. `live` is never inferred from a URL that
 *   merely looks plausible, and `failed` is never softened into "queued".
 * - A published URL is passed through untouched or not at all. It is not assembled
 *   from a site slug, because a wrong URL would send someone to a hostname that
 *   does not exist.
 */

// ── Deployment states ─────────────────────────────────────────────────────────

/**
 * Lifecycle of one publish attempt.
 *
 * DRAFT     — saved by the platform, not yet requested.
 * QUEUED    — requested and waiting for a build slot.
 * BUILDING  — a builder is running.
 * LIVE      — the backend reported this version is serving traffic.
 * FAILED    — the build or the deploy step failed. The backend's reason is shown.
 * STOPPED   — cancelled before it finished, by the user or by the platform.
 */
export const DEPLOYMENT_STATUS = Object.freeze({
  DRAFT: 'draft',
  QUEUED: 'queued',
  BUILDING: 'building',
  LIVE: 'live',
  FAILED: 'failed',
  STOPPED: 'stopped',
})

export const DEPLOYMENT_STATUSES = Object.freeze(Object.values(DEPLOYMENT_STATUS))

export const DEPLOYMENT_STATUS_LABEL_KEYS = Object.freeze({
  [DEPLOYMENT_STATUS.DRAFT]: 'workspaceDeployments.status.draft',
  [DEPLOYMENT_STATUS.QUEUED]: 'workspaceDeployments.status.queued',
  [DEPLOYMENT_STATUS.BUILDING]: 'workspaceDeployments.status.building',
  [DEPLOYMENT_STATUS.LIVE]: 'workspaceDeployments.status.live',
  [DEPLOYMENT_STATUS.FAILED]: 'workspaceDeployments.status.failed',
  [DEPLOYMENT_STATUS.STOPPED]: 'workspaceDeployments.status.stopped',
})

export const DEPLOYMENT_STATUS_VARIANTS = Object.freeze({
  [DEPLOYMENT_STATUS.DRAFT]: 'draft',
  [DEPLOYMENT_STATUS.QUEUED]: 'queued',
  [DEPLOYMENT_STATUS.BUILDING]: 'building',
  [DEPLOYMENT_STATUS.LIVE]: 'live',
  [DEPLOYMENT_STATUS.FAILED]: 'failed',
  [DEPLOYMENT_STATUS.STOPPED]: 'stopped',
})

export const isKnownDeploymentStatus = (status) => DEPLOYMENT_STATUSES.includes(status)

/**
 * True while a build is still moving. A deployment in one of these states is the
 * one currently on the record, so the UI shows it as the latest.
 */
export const isPendingDeployment = (status) =>
  status === DEPLOYMENT_STATUS.QUEUED || status === DEPLOYMENT_STATUS.BUILDING

// ── Normalization ─────────────────────────────────────────────────────────────

const readString = (payload, ...keys) => {
  for (const key of keys) {
    const value = payload?.[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return null
}

/**
 * Maps a raw API record onto a Deployment.
 *
 * Returns null for a non-object or a payload with no id, so a malformed row is
 * dropped instead of rendering as an unnamed build.
 *
 * `version` is a string on purpose: build versions are commonly hashes or
 * `v12-3f9a` shapes, and coercing those to a number would lose information.
 */
export const normalizeDeployment = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const id = readString(raw, 'id', 'deploymentId', 'deployment_id')
  if (!id) {
    return null
  }

  // Read, never inferred. An unknown value falls back to `draft` because that is
  // the only state that claims nothing about a build.
  const status = isKnownDeploymentStatus(raw.status)
    ? raw.status
    : DEPLOYMENT_STATUS.DRAFT

  return {
    id,
    siteId: readString(raw, 'siteId', 'site_id', 'site'),
    // The backend's own words, or null.
    status,
    version: readString(raw, 'version', 'buildVersion', 'build_version', 'commit'),
    // Passed through exactly as sent, or null. Never assembled from a site slug.
    publishedUrl: readString(raw, 'publishedUrl', 'published_url', 'url'),
    // The backend's own words, or null. Never substituted.
    logMessage: readString(raw, 'logMessage', 'log_message', 'message', 'errorMessage', 'error'),
    triggeredBy: readString(raw, 'triggeredBy', 'triggered_by', 'actor'),
    createdAt: readString(raw, 'createdAt', 'created_at', 'queuedAt', 'queued_at'),
    startedAt: readString(raw, 'startedAt', 'started_at'),
    finishedAt: readString(raw, 'finishedAt', 'finished_at', 'completedAt', 'completed_at'),
  }
}

/** Maps a backend list onto deployments, dropping malformed rows. */
export const normalizeDeploymentList = (items) => {
  if (!Array.isArray(items)) return []
  return items.map(normalizeDeployment).filter(Boolean)
}

/**
 * The most recent live deployment for a site, or null.
 *
 * Scans the loaded rows only and trusts `live` as reported. With no backend there
 * are no rows, so the answer is null and the UI says nothing is published yet.
 */
export const findLiveDeployment = (deployments = [], siteId = null) => {
  const rows = siteId
    ? deployments.filter((deployment) => deployment.siteId === siteId)
    : deployments

  return rows.find((deployment) => deployment.status === DEPLOYMENT_STATUS.LIVE) ?? null
}

/** The newest row of a list, using the timestamps the backend supplied. */
export const sortDeploymentsByCreatedAt = (deployments = []) =>
  [...deployments].sort((a, b) => {
    const left = a.createdAt ? Date.parse(a.createdAt) : NaN
    const right = b.createdAt ? Date.parse(b.createdAt) : NaN
    if (Number.isNaN(left) && Number.isNaN(right)) return 0
    if (Number.isNaN(left)) return 1
    if (Number.isNaN(right)) return -1
    return right - left
  })

// ── Search / filter / counts ──────────────────────────────────────────────────

export const deploymentMatchesQuery = (deployment, query) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  return [deployment.id, deployment.version, deployment.status, deployment.publishedUrl, deployment.logMessage]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle))
}

export const DEPLOYMENT_FILTER_ALL = 'all'

/** Filters the loaded list by state, site and search term. Runs over loaded rows only. */
export const filterDeployments = (
  deployments = [],
  { query = '', status = DEPLOYMENT_FILTER_ALL, siteId = null } = {}
) =>
  deployments.filter((deployment) => {
    const matchesStatus = status === DEPLOYMENT_FILTER_ALL || deployment.status === status
    const matchesSite = !siteId || deployment.siteId === siteId
    return matchesStatus && matchesSite && deploymentMatchesQuery(deployment, query)
  })

/** Counts per state, for the summary. Derived from loaded rows only. */
export const countDeploymentsByStatus = (deployments = []) => {
  const counts = Object.fromEntries(DEPLOYMENT_STATUSES.map((status) => [status, 0]))
  for (const deployment of deployments) {
    if (counts[deployment.status] !== undefined) {
      counts[deployment.status] += 1
    }
  }
  return counts
}

// ── Action availability ───────────────────────────────────────────────────────

/**
 * Which actions the UI may offer for one deployment.
 *
 * A *presentation* guard derived from the reported state, not permission logic. It
 * never enables anything by itself: every action still calls the service, which
 * refuses without a backend. Its job is to avoid offering "Stop" on a build that
 * already finished, or "Rollback" to a version that is not on record.
 */
export const getDeploymentActions = (deployment, { latestLive = null } = {}) => {
  if (!deployment) {
    return { canStop: false, canRedeploy: false, canRollback: false }
  }

  const isRunning = isPendingDeployment(deployment.status)
  const isFinished = Boolean(deployment.finishedAt)
  const isLive = deployment.status === DEPLOYMENT_STATUS.LIVE
  const isLatestLive = latestLive?.id === deployment.id

  return {
    // Only something still moving can be stopped.
    canStop: isRunning && !isFinished,
    // A finished build can be republished, whatever the outcome was.
    canRedeploy: isFinished && !isRunning,
    // Rolling back to a version only makes sense for a finished build that is not
    // the version currently serving.
    canRollback: isFinished && !isLatestLive && !isRunning,
    isLive,
  }
}

/**
 * Whether the "Deploy" button on a site may be pressed.
 *
 * Presence of a backend decides that, not a state: with no backend the service
 * would refuse anyway, so the button stays disabled and says why.
 */
export const canDeploySite = (isBackendConnected) => Boolean(isBackendConnected)
