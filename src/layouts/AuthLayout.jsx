import { Link, Outlet } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import BrandLogo from '@/components/common/BrandLogo'
import ThemeToggle from '@/components/common/ThemeToggle'
import { APP_NAME } from '@/utils/constants'

function AuthDiagram() {
  return (
    <svg
      viewBox="0 0 560 420"
      className="auth-diagram"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="auth-diagram-line" x1="70" y1="80" x2="470" y2="340" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A5B4FC" stopOpacity=".95" />
          <stop offset="1" stopColor="#818CF8" stopOpacity=".25" />
        </linearGradient>
      </defs>

      <circle className="auth-diagram__ring" cx="336" cy="204" r="152" stroke="#FFFFFF" strokeOpacity=".07" strokeWidth="1" strokeDasharray="3 9" />
      <circle className="auth-diagram__ring" cx="336" cy="204" r="210" stroke="#FFFFFF" strokeOpacity=".05" strokeWidth="1" strokeDasharray="3 12" />

      <g className="auth-diagram__links" stroke="url(#auth-diagram-line)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M196 92 C 226 92, 230 136, 252 150" />
        <path d="M196 202 C 226 202, 230 200, 252 200" />
        <path d="M196 312 C 226 312, 230 246, 252 244" />
      </g>

      <g className="auth-diagram__dots" fill="#C7D2FE">
        <circle cx="252" cy="150" r="4" fillOpacity=".9" />
        <circle cx="252" cy="200" r="4" fillOpacity=".9" />
        <circle cx="252" cy="244" r="4" fillOpacity=".9" />
      </g>

      <g className="auth-diagram__hub">
        <rect x="252" y="118" width="132" height="154" rx="20" fill="#FFFFFF" fillOpacity=".08" stroke="#FFFFFF" strokeOpacity=".2" />
        <rect x="278" y="138" width="80" height="12" rx="6" fill="#FFFFFF" fillOpacity=".45" />
        <rect x="270" y="172" width="96" height="24" rx="12" fill="#FFFFFF" fillOpacity=".1" stroke="#FFFFFF" strokeOpacity=".2" />
        <rect x="270" y="202" width="96" height="24" rx="12" fill="#818CF8" fillOpacity=".85" />
        <rect x="270" y="232" width="96" height="24" rx="12" fill="#FFFFFF" fillOpacity=".1" stroke="#FFFFFF" strokeOpacity=".2" />
      </g>

      <g className="auth-diagram__role">
        <rect x="64" y="60" width="132" height="64" rx="16" fill="#FFFFFF" fillOpacity=".06" stroke="#FFFFFF" strokeOpacity=".16" />
        <rect x="78" y="74" width="28" height="28" rx="8" fill="#FFFFFF" fillOpacity=".12" />
        <rect x="118" y="82" width="62" height="9" rx="4.5" fill="#FFFFFF" fillOpacity=".5" />
        <rect x="118" y="99" width="40" height="7" rx="3.5" fill="#FFFFFF" fillOpacity=".26" />
      </g>
      <g className="auth-diagram__role">
        <rect x="64" y="170" width="132" height="64" rx="16" fill="#FFFFFF" fillOpacity=".06" stroke="#FFFFFF" strokeOpacity=".16" />
        <rect x="78" y="184" width="28" height="28" rx="8" fill="#FFFFFF" fillOpacity=".12" />
        <rect x="118" y="192" width="62" height="9" rx="4.5" fill="#FFFFFF" fillOpacity=".5" />
        <rect x="118" y="209" width="40" height="7" rx="3.5" fill="#FFFFFF" fillOpacity=".26" />
      </g>
      <g className="auth-diagram__role">
        <rect x="64" y="280" width="132" height="64" rx="16" fill="#FFFFFF" fillOpacity=".06" stroke="#FFFFFF" strokeOpacity=".16" />
        <rect x="78" y="294" width="28" height="28" rx="8" fill="#FFFFFF" fillOpacity=".12" />
        <rect x="118" y="302" width="62" height="9" rx="4.5" fill="#FFFFFF" fillOpacity=".5" />
        <rect x="118" y="319" width="40" height="7" rx="3.5" fill="#FFFFFF" fillOpacity=".26" />
      </g>

      <g className="auth-diagram__schedule">
        <rect x="52" y="356" width="456" height="30" rx="15" fill="#FFFFFF" fillOpacity=".05" stroke="#FFFFFF" strokeOpacity=".14" />
        <rect x="68" y="363" width="46" height="16" rx="8" fill="#A5B4FC" fillOpacity=".6" />
        <rect x="124" y="363" width="72" height="16" rx="8" fill="#FFFFFF" fillOpacity=".14" />
        <rect x="206" y="363" width="54" height="16" rx="8" fill="#FFFFFF" fillOpacity=".14" />
        <rect x="270" y="363" width="88" height="16" rx="8" fill="#818CF8" fillOpacity=".5" />
        <rect x="368" y="363" width="62" height="16" rx="8" fill="#FFFFFF" fillOpacity=".14" />
      </g>
    </svg>
  )
}

function AuthLayout() {
  const year = new Date().getFullYear()

  return (
    <div className="auth-layout">
      <main className="auth-form">
        <div className="auth-form__inner">
          <div className="auth-form__top">
            <Link to="/" className="auth-form__brand" aria-label={`${APP_NAME} home`}>
              <BrandLogo size={36} />
              <span>{APP_NAME}</span>
            </Link>
            <ThemeToggle />
          </div>

          <Outlet />

          <Link to="/" className="auth-form__helper">
            <ArrowLeft size={14} aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </main>

      <aside className="auth-visual">
        <div className="auth-visual__content">
          <div className="auth-visual__copy">
            <p className="auth-visual__eyebrow">A connected academic workspace</p>
            <h1 className="auth-visual__title">
              Everything the school runs on, in one place.
            </h1>
            <p className="auth-visual__subtitle">
              Administration, teaching and student workflows stay aligned — shared
              schedules, attendance and results without the back-and-forth.
            </p>
          </div>

          <div className="auth-visual__diagram">
            <AuthDiagram />
          </div>
        </div>

        <div className="auth-visual__foot">
          <p>&copy; {year} {APP_NAME}</p>
          <div className="auth-visual__foot-links">
            <Link to="/">Product</Link>
            <Link to="/">Contact</Link>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default AuthLayout