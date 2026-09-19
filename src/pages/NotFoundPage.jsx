import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="page page--centered">
      <h1>404</h1>
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link className="btn btn--primary" to="/dashboard">
        Back to Dashboard
      </Link>
    </section>
  )
}

export default NotFoundPage