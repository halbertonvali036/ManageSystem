import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function NextStepsPanel({ title = 'Next steps', hint, steps }) {
  return (
    <section className="workspace-next" aria-labelledby="workspace-next-title">
      <header className="workspace-next__head">
        <h2 id="workspace-next-title" className="workspace-next__title">
          {title}
        </h2>
        {hint ? <p className="workspace-next__hint">{hint}</p> : null}
      </header>
      <div className="workspace-next__grid">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <Link
              key={step.to}
              to={step.to}
              className="workspace-next__tile"
            >
              <span className="workspace-next__tile-icon" aria-hidden="true">
                <Icon size={20} />
              </span>
              <span className="workspace-next__tile-label">{step.label}</span>
              <span className="workspace-next__tile-helper">{step.helper}</span>
              <ArrowRight
                size={15}
                className="workspace-next__tile-arrow"
                aria-hidden="true"
              />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default NextStepsPanel