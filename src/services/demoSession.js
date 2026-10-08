import { revokeAllMediaUrls } from '@/models/siteMedia'
import config from '@/config'

// Volatile preview data only. Never substitutes for an API or a real session.
export const isDemoSession = () => {
  if (import.meta.env.VITE_ENABLE_DEMO_AUTH !== 'true' || config.api.baseUrl) return false
  try {
    const session = JSON.parse(sessionStorage.getItem('managesystem-auth-session') ?? localStorage.getItem('managesystem-auth-session') ?? 'null')
    return session?.token === 'mock-jwt-token' && ['demo-member', 'demo-admin'].includes(session?.user?.id)
  } catch { return false }
}

let state
export const resetDemoSession = () => { state = undefined; revokeAllMediaUrls() }
export const getDemoSession = () => {
  if (!isDemoSession()) return null
  state ??= {
    workspaces: [{ id: 'demo-workspace', name: 'Demo Workspace', slug: 'demo-workspace', ownerId: 'demo-member' }],
    sites: [{ id: 'demo-website', workspaceId: 'demo-workspace', name: 'Demo Website · Orbit', slug: 'orbit-demo', status: 'draft', templateId: 'business', themePresetId: 'emerald' }],
    documents: {},
    settings: {},
  }
  return state
}

export const filterDemoSites = (sites, { status = 'all', search = '' } = {}) =>
  sites.filter(site => (!status || status === 'all' || site.status === status) && `${site.name} ${site.slug}`.toLowerCase().includes(search.trim().toLowerCase()))

export const rememberDemoDraft = (siteId, document) => {
  const demo = getDemoSession()
  if (demo?.sites.some(site => site.id === siteId)) demo.documents[siteId] = document
}
