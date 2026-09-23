import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarRange,
  GraduationCap,
  Layers,
  Megaphone,
  School,
  Users,
} from 'lucide-react'
import BrandLogo from '@/components/common/BrandLogo'
import ThemeToggle from '@/components/common/ThemeToggle'
import { APP_NAME } from '@/utils/constants'
import '@/styles/landing.css'

const ROLES = [
  {
    index: '01',
    icon: Building2,
    title: 'Administration',
    description:
      'Keep people, academic structure, attendance and reporting organized from one administration workspace.',
    tone: 'admin',
    tag: 'Oversight',
    flows: ['People & access', 'Academic structure', 'Attendance & reporting'],
  },
  {
    index: '02',
    icon: BookOpen,
    title: 'Teaching',
    description:
      'Coordinate classes, mark attendance and manage assessments and grades without leaving the flow.',
    tone: 'teacher',
    tag: 'Delivery',
    flows: ['Classes', 'Attendance', 'Assessments & grades'],
  },
  {
    index: '03',
    icon: GraduationCap,
    title: 'Student learning',
    description:
      'Keep courses, schedules, attendance and academic updates close at hand throughout the year.',
    tone: 'student',
    tag: 'Learning',
    flows: ['Schedule', 'Courses', 'Results'],
  },
]

const CAPABILITIES = [
  {
    icon: CalendarCheck,
    tone: 'accent',
    size: 'lead',
    title: 'Attendance',
    text: 'Record and review participation with session-based attendance workflows that stay consistent for every role.',
    flows: ['Session marking', 'Participation status', 'Attendance history'],
  },
  {
    icon: Award,
    tone: 'accent',
    size: 'tall',
    title: 'Assessments & grades',
    text: 'Run assessment and grading workflows that stay consistent across classes and reporting periods.',
  },
  { icon: Users, tone: 'admin', title: 'Students & teachers', text: 'People, profiles and class rosters in one place.' },
  { icon: School, tone: 'teacher', title: 'Courses & classes', text: 'The academic structure that ties enrollment together.' },
  { icon: CalendarRange, tone: 'student', title: 'Scheduling', text: 'Coordinate weekly schedules across classes and staff.' },
  { icon: BarChart3, tone: 'admin', size: 'half', title: 'Reports', text: 'Generate filtered academic reports for the decisions that matter.' },
  { icon: Megaphone, tone: 'student', size: 'half', title: 'Announcements', text: 'Share timely updates across the whole school community.' },
]

const HUB_FLOWS = ['Classes', 'Schedule', 'Attendance', 'Grades']

function SystemDiagram() {
  return (
    <div
      className="landing-visual anim-scale-in anim-delay-3"
      role="img"
      aria-label="Diagram showing administration, teaching and student workspaces connected to shared classes, schedules, attendance and grades flows"
    >
      <div className="landing-visual__glow" aria-hidden="true" />

      <svg className="landing-visual__lines" viewBox="0 0 640 520" fill="none" aria-hidden="true">
        <g className="landing-visual__rings">
          <circle cx="320" cy="265" r="150" />
          <circle cx="320" cy="265" r="205" />
          <circle cx="320" cy="265" r="260" />
        </g>
        <g className="landing-visual__connectors">
          <path d="M250 274 C 190 250, 152 210, 112 150" />
          <path d="M390 274 C 450 250, 488 210, 528 150" />
          <path d="M320 298 C 320 358, 320 422, 320 452" />
          <circle className="landing-visual__junction" cx="112" cy="150" r="5" />
          <circle className="landing-visual__junction" cx="528" cy="150" r="5" />
          <circle className="landing-visual__junction" cx="320" cy="452" r="5" />
        </g>
      </svg>

      <div className="landing-visual__hub" aria-hidden="true">
        <span className="landing-visual__hub-mark"><BrandLogo size={34} /></span>
        <span className="landing-visual__hub-title">Academic core</span>
        <ul className="landing-visual__hub-flows">
          {HUB_FLOWS.map((flow) => (
            <li key={flow}>{flow}</li>
          ))}
        </ul>
      </div>

      <div className="landing-visual__role landing-visual__role--admin">
        <span className="landing-visual__role-icon"><Building2 size={17} aria-hidden="true" /></span>
        <span className="landing-visual__role-copy">
          <span className="landing-visual__role-name">Administration</span>
          <span className="landing-visual__role-tag">Oversight</span>
        </span>
      </div>

      <div className="landing-visual__role landing-visual__role--teacher">
        <span className="landing-visual__role-icon"><BookOpen size={17} aria-hidden="true" /></span>
        <span className="landing-visual__role-copy">
          <span className="landing-visual__role-name">Teaching</span>
          <span className="landing-visual__role-tag">Delivery</span>
        </span>
      </div>

      <div className="landing-visual__role landing-visual__role--student">
        <span className="landing-visual__role-icon"><GraduationCap size={17} aria-hidden="true" /></span>
        <span className="landing-visual__role-copy">
          <span className="landing-visual__role-name">Student learning</span>
          <span className="landing-visual__role-tag">Learning</span>
        </span>
      </div>
    </div>
  )
}

function LandingPage() {
  return (
    <div className="landing-page" id="top">
      <header className="public-header">
        <div className="public-header__inner">
          <a className="public-brand" href="#top" aria-label={`${APP_NAME} home`}>
            <BrandLogo size={36} />
            <span>{APP_NAME}</span>
          </a>
          <nav className="public-nav" aria-label="Main navigation">
            <a className="public-nav__home" href="#top" aria-current="page">Home</a>
            <ThemeToggle className="theme-toggle--public" />
            <Link className="public-nav__register" to="/register">Create account</Link>
            <Link className="public-nav__sign-in" to="/login">Sign In</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero__inner">
            <div className="landing-hero__copy">
              <p className="landing-eyebrow anim-fade-up anim-delay-1">One platform · Every academic role</p>
              <h1 id="landing-title" className="anim-fade-up anim-delay-2">
                Academic operations,<br />
                <span className="landing-hero__accent">working as one.</span>
              </h1>
              <p className="landing-hero__description anim-fade-up anim-delay-3">
                Student Management System unifies administration, teaching and
                student workflows in one clear, dependable platform — so the
                daily work of the school stays connected.
              </p>
              <div className="landing-hero__actions anim-fade-up anim-delay-4">
                <Link to="/login" className="landing-button landing-button--primary">
                  Sign In <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <a className="landing-button landing-button--secondary" href="#workspaces">
                  Explore workspaces
                </a>
              </div>
              <p className="landing-hero__flowline anim-fade-up anim-delay-5">
                <Layers size={15} aria-hidden="true" />
                <span>Classes · Schedules · Attendance · Grades · Reports</span>
              </p>
            </div>
            <SystemDiagram />
          </div>
        </section>

        <section className="landing-section landing-roles" id="workspaces" aria-labelledby="roles-title">
          <div className="landing-section__heading anim-fade-up">
            <p className="landing-eyebrow">Purpose-built workspaces</p>
            <h2 id="roles-title">A clearer view for every role.</h2>
            <p>Shared academic information, shaped around the work each person actually does.</p>
          </div>
          <div className="landing-roles__grid">
            {ROLES.map(({ index, icon: Icon, title, description, tone, tag, flows }) => (
              <article
                className={`landing-role-card landing-role-card--${tone}${tone === 'admin' ? ' landing-role-card--lead' : ''}`}
                key={title}
              >
                <div className="landing-role-card__top">
                  <span className="landing-role-card__index" aria-hidden="true">{index}</span>
                  <span className="landing-role-card__icon"><Icon size={20} aria-hidden="true" /></span>
                </div>
                <div className="landing-role-card__tag" aria-hidden="true">{tag}</div>
                <h3>{title}</h3>
                <p>{description}</p>
                <ul className="landing-role-card__flows" aria-label={`${title} workflows`}>
                  {flows.map((flow) => (
                    <li key={flow}>{flow}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-capabilities" aria-labelledby="capabilities-title">
          <div className="landing-section__heading landing-section__heading--row anim-fade-up">
            <div>
              <p className="landing-eyebrow">Core capabilities</p>
              <h2 id="capabilities-title">The essentials, connected.</h2>
            </div>
            <p>The academic workflows teams depend on daily — structured, consistent, and in one place.</p>
          </div>
          <div className="landing-feature-grid">
            {CAPABILITIES.map(({ icon: Icon, tone, size = 'third', title, text, flows }) => (
              <article
                className={`landing-feature landing-feature--${tone} landing-feature--${size}`}
                key={title}
              >
                <span className="landing-feature__icon"><Icon size={18} aria-hidden="true" /></span>
                <div className="landing-feature__body">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                {flows && (
                  <ul className="landing-feature__flows" aria-label={`${title} items`}>
                    {flows.map((flow) => (
                      <li key={flow}>{flow}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="landing-final-cta" aria-labelledby="landing-cta-title">
          <div className="landing-final-cta__content">
            <p className="landing-eyebrow">Ready when you are</p>
            <h2 id="landing-cta-title">Bring the day’s work into focus.</h2>
            <p>Sign in to continue to your administration, teaching or student workspace.</p>
          </div>
          <div className="landing-final-cta__actions">
            <Link to="/login" className="landing-button landing-button--light">
              Sign In <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link to="/register" className="landing-button landing-button--ghost-on-dark">
              Create account
            </Link>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <a className="public-brand public-brand--footer" href="#top" aria-label={`${APP_NAME} home`}>
          <BrandLogo size={30} />
          <span>{APP_NAME}</span>
        </a>
        <span className="public-footer__caption">A connected academic workspace</span>
        <a className="public-footer__link" href="#top">Back to top</a>
      </footer>
    </div>
  )
}

export default LandingPage