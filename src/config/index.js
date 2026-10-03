const config = {
  publishing: { baseDomain: import.meta.env.VITE_PLATFORM_BASE_DOMAIN || undefined },
  api: {
    baseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, ''),
  },
  qrLogin: {
    // Optional deep-link base for the companion mobile app, for example
    // `app://login/qr`. It is intentionally empty: no scheme is assumed as the
    // final truth, and the QR page falls back to written instructions until a
    // mobile team configures the real value.
    appDeepLinkBase: import.meta.env.VITE_QR_APP_DEEP_LINK ?? '',
  },
}

export default config
