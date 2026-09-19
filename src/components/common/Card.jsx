function Card({ title, action, className, children }) {
  return (
    <section className={`card${className ? ` ${className}` : ''}`}>
      {title || action ? (
        <header className="card__header">
          {title ? <h2 className="card__title">{title}</h2> : <span />}
          {action ? <div className="card__action">{action}</div> : null}
        </header>
      ) : null}
      <div className="card__body">{children}</div>
    </section>
  )
}

export default Card