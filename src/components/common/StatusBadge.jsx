function StatusBadge({ status, labels = {}, className = '' }) {
  const normalized = Object.hasOwn(labels, status) ? status : 'unknown'
  const classNames = [`status-badge`, `status-badge--${normalized}`, className]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={classNames}>
      {labels[normalized] ?? labels[status] ?? status ?? 'Unknown'}
    </span>
  )
}

export default StatusBadge