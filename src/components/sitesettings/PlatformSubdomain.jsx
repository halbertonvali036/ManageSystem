import { useState } from 'react'
import config from '@/config'
import useTranslation from '@/hooks/useTranslation'
import siteService from '@/services/siteService'
import { getRequestErrorMessage } from '@/services/httpClient'

export default function PlatformSubdomain({ siteId, site, onSiteChange }) {
  const { t } = useTranslation()
  const [editedSlug, setEditedSlug] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const slug = editedSlug ?? site?.slug ?? ''
  const valid = slug.length <= 63 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  const base = config.publishing.baseDomain

  const save = async () => {
    setBusy(true)
    setNotice('')
    try {
      // Read immediately before PUT: the API requires the complete current content.
      const current = await siteService.getSite(siteId)
      if (!current) throw new Error(t('publishing.domainLoadFailed'))
      const updated = await siteService.updateSite(siteId, {
        name: current.name,
        content: current.content,
        slug,
      })
      if (!updated) throw new Error(t('publishing.domainLoadFailed'))
      onSiteChange(updated)
      setEditedSlug(null)
      setNotice(t('publishing.subdomainSaved'))
    } catch (error) {
      setNotice(getRequestErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="domain-foundation">
      <label htmlFor="platform-subdomain">{t('publishing.subdomain')}</label>
      <div className="domain-subdomain">
        <input id="platform-subdomain" className="editor-input" value={slug}
          maxLength={63} disabled={!site || busy}
          onChange={(event) => setEditedSlug(event.target.value.toLowerCase())}
          aria-invalid={Boolean(slug) && !valid}
          aria-describedby="subdomain-note" />
        <span>{base ? `.${base}` : t('publishing.baseUndefined')}</span>
      </div>
      <p id="subdomain-note">{t('publishing.subdomainNote')}</p>
      <button className="btn btn--outline" type="button" onClick={save}
        disabled={!site || !config.api.baseUrl || busy || !valid || slug === site.slug}>
        {t(busy ? 'common.saving' : 'common.save')}
      </button>
      <p role="status" aria-live="polite">{notice}</p>
    </div>
  )
}
