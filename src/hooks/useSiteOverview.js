import { useEffect, useState } from 'react'
import siteService from '@/services/siteService'

/**
 * The site metadata behind the editor header.
 *
 * A missing or failed request is not an error here: the editor is usable from a
 * local draft alone, so the header simply falls back to the draft's own name.
 * The result carries the id it was loaded for, so a slow response for the
 * previous site can never label the next one.
 */
export default function useSiteOverview(siteId) {
  const [siteResult, setSiteResult] = useState(null)

  useEffect(() => {
    let active = true
    siteService.getSite(siteId).then((site) => { if (active) setSiteResult({ siteId, site }) }).catch(() => {})
    return () => { active = false }
  }, [siteId])

  return siteResult?.siteId === siteId ? siteResult.site : null
}
