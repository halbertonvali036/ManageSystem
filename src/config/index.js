const config = {
  publishing: { baseDomain: import.meta.env.VITE_PLATFORM_BASE_DOMAIN || undefined },
  api: {
    baseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, ''),
  },
}

export default config
