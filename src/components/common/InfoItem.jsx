function InfoItem({ label, children }) {
  const isEmpty = children == null || children === '' || children === '—'
  return (
    <div className="info-item">
      <dt className="info-item__label">{label}</dt>
      <dd
        className={`info-item__value${isEmpty ? ' info-item__value--empty' : ''}`}
      >
        {children || '—'}
      </dd>
    </div>
  )
}

export default InfoItem