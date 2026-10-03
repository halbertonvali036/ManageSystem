import { useState } from 'react'
import { Check, Copy, Info } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { DNS_RECORD_TYPE_HINT_KEYS } from '@/models/domain'

/**
 * The DNS records a customer has to add, as a table.
 *
 * Every value shown here came from the backend. Nothing is generated: an empty list
 * means "the backend has not told us what to set yet", and the table says exactly
 * that rather than showing a sample A record pointing somewhere invented. A wrong
 * value in this table is worse than no table — it breaks a real domain and the
 * customer has no way to tell the difference from a correct one.
 *
 * Copy is offered per cell because a DNS panel is somewhere else entirely, and
 * retyping an IP or a verification token is a reliable way to introduce a typo.
 */
function DnsRecordTable({ records, isLoading = false }) {
  const { t } = useTranslation()
  const [copiedKey, setCopiedKey] = useState(null)

  const copyValue = async (record) => {
    const value = record.value
    if (!value || !navigator?.clipboard?.writeText) return

    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(record.id)
    } catch {
      // A denied clipboard permission is not worth an error banner; the value is
      // selectable text and the user can copy it by hand.
      setCopiedKey(null)
    }
  }

  if (isLoading) {
    return (
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        {t('workspaceDomains.dns.loading')}
      </div>
    )
  }

  if (!records || records.length === 0) {
    // Deliberately no fallback rows: see the note above.
    return (
      <div className="dom-empty">
        <Info size={18} aria-hidden="true" />
        <p className="dom-empty__text">{t('workspaceDomains.dns.empty')}</p>
      </div>
    )
  }

  // Explain only the record kinds actually on show, so the guidance matches the table.
  const usedTypes = [...new Set(records.map((record) => record.type))]

  return (
    <div className="dom-dns">
      <div className="dom-dns__head" aria-hidden="true">
        <span>{t('workspaceDomains.dns.type')}</span>
        <span>{t('workspaceDomains.dns.host')}</span>
        <span>{t('workspaceDomains.dns.value')}</span>
        <span>{t('workspaceDomains.dns.priority')}</span>
        <span />
      </div>

      <ul className="dom-dns__rows">
        {records.map((record) => {
          const isCopied = copiedKey === record.id

          return (
            <li className="dom-dns__row" key={record.id}>
              <span className="dom-dns__type" data-label={t('workspaceDomains.dns.type')}>
                {record.type}
              </span>
              <span className="dom-dns__host" data-label={t('workspaceDomains.dns.host')}>
                <code>{record.host}</code>
              </span>
              <span className="dom-dns__value" data-label={t('workspaceDomains.dns.value')}>
                <code>{record.value}</code>
              </span>
              <span className="dom-dns__priority" data-label={t('workspaceDomains.dns.priority')}>
                {record.priority ?? '—'}
              </span>
              <span className="dom-dns__copy">
                <button
                  type="button"
                  className="btn btn--ghost dom-dns__copy-btn"
                  onClick={() => copyValue(record)}
                  aria-label={t('workspaceDomains.dns.copyValue', { value: record.value })}
                >
                  {isCopied ? (
                    <Check size={15} aria-hidden="true" />
                  ) : (
                    <Copy size={15} aria-hidden="true" />
                  )}
                  <span className="visually-hidden">
                    {isCopied
                      ? t('workspaceDomains.dns.copied')
                      : t('workspaceDomains.dns.copy')}
                  </span>
                </button>
              </span>
            </li>
          )
        })}
      </ul>

      <ul className="dom-dns__hints">
        {usedTypes.map((type) => (
          <li className="dom-dns__hint" key={type}>
            <strong>{type}</strong>
            <span>{t(DNS_RECORD_TYPE_HINT_KEYS[type])}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DnsRecordTable
