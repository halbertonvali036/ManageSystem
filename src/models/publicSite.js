/** Backend request for a visitor host; platform root is not a tenant slug. */
export const publicSiteEndpoint = (hostname, baseDomain = '') => {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  const base = baseDomain.toLowerCase().replace(/\.$/, '')
  if (base && host.endsWith(`.${base}`)) {
    const slug = host.slice(0, -(base.length + 1))
    if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 63) {
      return `/api/public/sites/${encodeURIComponent(slug)}`
    }
  }
  return `/api/public/sites/by-domain?${new URLSearchParams({ host })}`
}

export const publicPageForPath = (pages, pathname) => {
  let slug
  try {
    slug = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '')
  } catch {
    return null
  }
  return pages.find((page) => slug ? page.slug === slug : page.isHome) ?? null
}
