import useTranslation from '@/hooks/useTranslation'

// Values are supplied by a backend adapter, never inferred from a hostname.
export default function DnsRecords({ records = [] }) {
  const { t } = useTranslation()
  return <section className="dns-records" aria-label={t('publishing.dns')}>
    <h4>{t('publishing.dns')}</h4>
    {records.length ? <table><caption className="sr-only">{t('publishing.dns')}</caption><thead><tr>{['type', 'host', 'value'].map((key) => <th scope="col" key={key}>{t(`publishing.${key}`)}</th>)}</tr></thead><tbody>{records.map((record, index) => <tr key={index}><td>{record.type}</td><td>{record.name}</td><td><code>{record.value}</code></td></tr>)}</tbody></table> : <p>{t('publishing.noDns')}</p>}
  </section>
}
