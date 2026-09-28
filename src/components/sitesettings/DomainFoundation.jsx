import { useState } from 'react'
import config from '@/config'
import useTranslation from '@/hooks/useTranslation'
import { normalizeDomainStatus } from '@/models/sitePublishing'
import DnsRecords from './DnsRecords'

export default function DomainFoundation({ remote }) {
  const { t } = useTranslation()
  const [slug, setSlug] = useState('')
  const domain = normalizeDomainStatus(remote)
  const base = config.publishing.baseDomain
  return <div className="domain-foundation">
    <label htmlFor="platform-subdomain">{t('publishing.subdomain')}</label>
    <div className="domain-subdomain"><input id="platform-subdomain" className="editor-input" value={slug} maxLength={63} onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder={t('publishing.slug')} aria-describedby="subdomain-note" /><span>{base ? `.${base}` : t('publishing.baseUndefined')}</span></div>
    <p id="subdomain-note">{t('publishing.subdomainNote')}</p>
    <h4>{t('publishing.customDomain')}</h4>
    <ol className="domain-steps">{['addDomain', 'dns', 'verify', 'connected'].map((key) => <li key={key}>{t(`publishing.${key}`)}</li>)}</ol>
    <p>{t('publishing.domain')}: <strong>{t(`publishing.domainStates.${domain.status}`)}</strong></p>
    <p>SSL: <strong>{t(`publishing.sslStates.${domain.ssl}`)}</strong></p>
    <DnsRecords records={domain.records} />
    <p id="domain-integration-note">{t('publishing.domainPending')}</p>
    <div className="publish-actions"><button className="btn btn--outline" type="button" disabled aria-describedby="domain-integration-note">{t('publishing.addDomain')}</button><button className="btn btn--outline" type="button" disabled aria-describedby="domain-integration-note">{t('publishing.verify')}</button></div>
  </div>
}
