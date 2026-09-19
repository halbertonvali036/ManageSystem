import { Outlet } from 'react-router-dom'
import { ClipboardCheck, ShieldCheck, Users } from 'lucide-react'
import BrandLogo from '@/components/common/BrandLogo'
import { APP_NAME } from '@/utils/constants'

const FEATURES = [
  { icon: Users, text: 'Students, teachers and classes in one place.' },
  { icon: ClipboardCheck, text: 'Attendance and grades, captured simply.' },
  { icon: ShieldCheck, text: 'Secure admin access for your whole team.' },
]

const FEATURE_DELAYS = ['anim-delay-3', 'anim-delay-4', 'anim-delay-5']

function AuthLayout() {
  const year = new Date().getFullYear()

  return (
    <div className="auth-layout">
      <aside className="auth-hero">
        <span className="auth-hero__orb auth-hero__orb--one" aria-hidden="true" />
        <span className="auth-hero__orb auth-hero__orb--two" aria-hidden="true" />
        <span className="auth-hero__orb auth-hero__orb--three" aria-hidden="true" />

        <div className="auth-hero__content">
          <span className="auth-hero__brand anim-fade-up">
            <BrandLogo size={40} />
            <span className="auth-hero__brand-name">{APP_NAME}</span>
          </span>

          <div className="auth-hero__copy">
            <h1 className="auth-hero__title anim-fade-up anim-delay-1">
              School administration, beautifully organized.
            </h1>
            <p className="auth-hero__subtitle anim-fade-up anim-delay-2">
              Everything you need to manage your school in one modern
              workspace.
            </p>

            <ul className="auth-hero__features">
              {FEATURES.map(({ icon: Icon, text }, index) => (
                <li
                  className={`auth-hero__feature anim-fade-up ${FEATURE_DELAYS[index]}`}
                  key={text}
                >
                  <span className="auth-hero__feature-icon">
                    <Icon size={18} />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="auth-hero__footer anim-fade-in anim-delay-5">
          &copy; {year} {APP_NAME}
        </p>
      </aside>

      <main className="auth-panel">
        <div className="auth-panel__inner">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AuthLayout