import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const SETTINGS_PATH = '/settings'

const ensureBackendConnection = () => {
  if (!config.api.baseUrl) {
    throw new BackendNotConnectedError()
  }
}

const getSettings = async () => {
  ensureBackendConnection()
  const response = await httpClient.get(SETTINGS_PATH)
  return response
}

const updateSettings = async (data) => {
  ensureBackendConnection()
  const response = await httpClient.put(SETTINGS_PATH, data)
  return response
}

const settingsService = {
  getSettings,
  updateSettings,
}

export default settingsService