const config = {
  publishing: {
    baseDomain: (import.meta.env.VITE_PLATFORM_BASE_DOMAIN ?? '').trim().toLowerCase(),
    // Use a separate hosting deployment for visitor sites, not the workspace.
    publicSiteMode: import.meta.env.VITE_PUBLIC_SITE_MODE === 'host',
  },
  api: {
    baseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, ''),
  },
}

export default config
