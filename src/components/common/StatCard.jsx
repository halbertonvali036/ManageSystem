function StatCard({ icon: Icon, label, value, accent = 'primary' }) {
  return (
    <div className="stat-card">
      <span
        className={`stat-card__icon stat-card__icon--${accent}`}
        aria-hidden="true"
      >
        <Icon size={22} />
      </span>
      <div className="stat-card__info">
        <p className="stat-card__value">{value}</p>
        <p className="stat-card__label">{label}</p>
      </div>
    </div>
  )
}

export default StatCard