import { Link } from 'react-router-dom'

function UnauthorizedPage() {
  return (
    <section className="page page--centered">
      <h1>403</h1>
      <h2>Access denied</h2>
      <p>You do not have permission to view this page.</p>
      <Link className="btn btn--primary" to="/dashboard">
        Back to Dashboard
      </Link>
    </section>
  )
}

export default UnauthorizedPage