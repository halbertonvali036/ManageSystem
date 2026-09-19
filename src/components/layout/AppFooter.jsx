import { APP_NAME } from '@/utils/constants'

function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="app-footer">
      <div className="container">
        <p>{APP_NAME} &mdash; &copy; {year}</p>
      </div>
    </footer>
  )
}

export default AppFooter