import { useEffect, useRef } from 'react'

const TONES = {
  danger: 'status-page__icon--danger',
  neutral: 'status-page__icon--neutral',
  success: 'status-page__icon--success',
}

function StatusPage({
  code,
  tone = 'neutral',
  icon: Icon,
  title,
  description,
  className,
  children,
}) {
  const titleRef = useRef(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  return (
    <section
      className={`page page--centered status-page anim-fade-up${
        className ? ` ${className}` : ''
      }`}
    >
      {code ? (
        <span className="status-page__code" aria-hidden="true">
          {code}
        </span>
      ) : null}
      <span
        className={`status-page__icon ${TONES[tone] ?? TONES.neutral}`}
        aria-hidden="true"
      >
        <Icon size={28} />
      </span>
      <h1 ref={titleRef} tabIndex={-1} className="status-page__title">
        {title}
      </h1>
      {description ? (
        <p className="status-page__text">{description}</p>
      ) : null}
      {children ? (
        <div className="status-page__actions">{children}</div>
      ) : null}
    </section>
  )
}

export default StatusPage