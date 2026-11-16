import config from '@/config'
import httpClient, { BackendNotConnectedError, RequestError } from '@/services/httpClient'
import { isKnownDeploymentStatus, normalizeDeployment, normalizeDeploymentList } from '@/models/deployment'
import siteService from '@/services/siteService'

const PATH = '/api/deployments'
const itemPath = id => `${PATH}/${encodeURIComponent(id)}`
const requireBackend = () => {
  if (!config.api.baseUrl) throw new BackendNotConnectedError()
}
const readDeployment = response => {
  const result = normalizeDeployment(response)
  if (!result) throw new RequestError('Invalid deployment response.')
  return result
}

const getDeployments = async ({ siteId = null, status = null } = {}) => {
  if (!config.api.baseUrl) return []
  const params = new URLSearchParams()
  if (siteId) params.set('siteId', siteId)
  if (status && isKnownDeploymentStatus(status)) params.set('status', status)
  const response = await httpClient.get(`${PATH}${params.size ? `?${params}` : ''}`)
  if (!Array.isArray(response)) throw new RequestError('Invalid deployment list.')
  return normalizeDeploymentList(response)
}

const getDeployment = async id => {
  if (!config.api.baseUrl || !id) return null
  return readDeployment(await httpClient.get(itemPath(id)))
}

const deploySite = async (siteId, { version = null } = {}) => {
  requireBackend()
  if (!siteId) throw new Error('A site is required to deploy.')
  return readDeployment(await httpClient.post(PATH, {
    siteId, ...(version !== null ? { version } : {}),
  }))
}

const action = async (id, name) => {
  requireBackend()
  return readDeployment(await httpClient.post(`${itemPath(id)}/${name}`, {}))
}

const getDeployableSites = async () => {
  if (!config.api.baseUrl) return []
  return siteService.getMySites()
}

export default {
  getDeployments, getDeployment, deploySite, getDeployableSites,
  redeploy: id => action(id, 'redeploy'),
  stopDeployment: id => action(id, 'stop'),
  rollbackDeployment: id => action(id, 'rollback'),
}
