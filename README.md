# Student Management System (Frontend)

Responsive React frontend for managing a school's students, teachers, courses,
classes, attendance, grades, assessments and announcements.

## Portals

- **Admin** — full control: students, teachers, departments, subjects,
  courses, classes, academic years, schedules, announcements, attendance,
  grades, assessments, reports, users, roles and settings.
- **Teacher** — teaching workspace: my classes, my students, attendance,
  grades (single + bulk), assessments, schedule, announcements and profile.
- **Student** — read-only academic view: my courses, classes, schedule,
  attendance records, grades, assessments, announcements and profile.

## Main frontend modules

- Resource pages with list / details / create / edit / delete flows
- Portal-specific dashboards (admin, teacher, student)
- Attendance marking (admin + teacher) and bulk grade entry
- Shared form validation, error taxonomy and backend-unavailable states
- Command palette, notifications, reports workspace and settings

## Tech stack

- React 19 + Vite
- React Router v7
- Lucide icons
- Oxlint (linting)
- No CSS framework; custom CSS in `src/styles`

## Folder structure

```
src/
  components/   Shared + feature components (admin, teacher, student)
  config/       App config (API base URL from env)
  context/      React contexts (auth)
  hooks/        Data hooks (useStudents, useMyGrades, ...)
  layouts/      Portal layouts (Main, Teacher, Student, Auth)
  models/       Shared domain constants and formatters
  pages/        Route-level pages (admin, teacher, student)
  routes/       Route definitions and guards
  services/     HTTP client + per-resource API services
  styles/       Global and portal stylesheets
  utils/        Validation, form helpers, constants
docs/
  frontend-api-handoff.md   API contract notes for the backend developer
```

## Setup

```bash
npm install
```

## Environment variable

Copy `.env.example` to `.env` and set the API base URL:

```bash
VITE_API_BASE_URL=https://api.example.com
```

Set to empty (default) while the backend is unavailable; the app renders
backend-unavailable states instead of failing.

## Scripts

```bash
npm run dev    # start the Vite dev server
npm run lint   # run Oxlint
npm run build  # production build to dist/
```

## Backend status

The backend is a separate deliverable and will be provided by the backend
developer. All data flows through `src/services` using `VITE_API_BASE_URL`;
there is no bundled backend and no fake data in the app.

## Demo authentication

Until real backend authentication is integrated, the app ships with a
temporary demo login (role selector on the sign-in page). This is
development-only and must be removed once real JWT/session auth is available.