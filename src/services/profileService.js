import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

/**
 * Account profile service.
 *
 * The profile page edits the signed-in account, so every path here is relative
 * to the session: the backend resolves who the caller is and no user id is ever
 * sent from the browser.
 *
 * Mutations deliberately refuse to run while no backend is connected. They
 * throw `BackendNotConnectedError` instead of resolving, so nothing in the UI
 * can mistake a local draft for a saved account. Reads of the profile are taken
 * from the session the backend already established, so there is no fetch here.
 */

const PROFILE_PATH = '/profile'

const ensureBackendConnection = () => {
  if (!config.api.baseUrl) {
    throw new BackendNotConnectedError()
  }
}

/** Whether profile writes can reach a backend at all. */
const isProfilePersistenceAvailable = () => Boolean(config.api.baseUrl)

/**
 * Persists the editable profile fields.
 *
 * The payload carries display name and any optional fields the account models;
 * the backend owns everything else (email, role, status, identifiers).
 */
const updateProfile = async (payload) => {
  ensureBackendConnection()
  const response = await httpClient.patch(PROFILE_PATH, payload)
  return response?.data ?? response ?? null
}

/**
 * Sends an avatar file as multipart form data.
 *
 * The byte validation in the model is a browser-side guard only — the backend
 * must inspect the bytes again before storing them.
 */
const uploadAvatar = async (file) => {
  ensureBackendConnection()
  const formData = new FormData()
  formData.append('avatar', file)
  const response = await httpClient.upload(`${PROFILE_PATH}/avatar`, formData)
  return response?.data ?? response ?? null
}

/** Removes the stored avatar for the signed-in account. */
const removeAvatar = async () => {
  ensureBackendConnection()
  await httpClient.delete(`${PROFILE_PATH}/avatar`)
}

const profileService = {
  isProfilePersistenceAvailable,
  updateProfile,
  uploadAvatar,
  removeAvatar,
}

export default profileService
