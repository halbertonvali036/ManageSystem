import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import BillingLayout from '@/layouts/BillingLayout'
import MainLayout from '@/layouts/MainLayout'
import SiteEditorLayout from '@/layouts/SiteEditorLayout'
import ProtectedRoute from '@/routes/ProtectedRoute'
import PublicRoute from '@/routes/PublicRoute'
import SecurityLayout from '@/layouts/SecurityLayout'
import useTranslation from '@/hooks/useTranslation'
import { SITES_PATH } from '@/utils/constants'

const AddAcademicYearPage = lazy(() => import('@/pages/AddAcademicYearPage'))
const AddAnnouncementPage = lazy(() => import('@/pages/AddAnnouncementPage'))
const AddAssessmentPage = lazy(() => import('@/pages/AddAssessmentPage'))
const AddClassPage = lazy(() => import('@/pages/AddClassPage'))
const AddSemesterPage = lazy(() => import('@/pages/AddSemesterPage'))
const AddCoursePage = lazy(() => import('@/pages/AddCoursePage'))
const AddDepartmentPage = lazy(() => import('@/pages/AddDepartmentPage'))
const AddGradePage = lazy(() => import('@/pages/AddGradePage'))
const AddRolePage = lazy(() => import('@/pages/AddRolePage'))
const AddStudentPage = lazy(() => import('@/pages/AddStudentPage'))
const AddSubjectPage = lazy(() => import('@/pages/AddSubjectPage'))
const AddUserPage = lazy(() => import('@/pages/AddUserPage'))
const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage'))
const AttendancePage = lazy(() => import('@/pages/AttendancePage'))
const AcademicYearDetailsPage = lazy(() => import('@/pages/AcademicYearDetailsPage'))
const AcademicYearsPage = lazy(() => import('@/pages/AcademicYearsPage'))
const AnnouncementDetailsPage = lazy(() => import('@/pages/AnnouncementDetailsPage'))
const AnnouncementsPage = lazy(() => import('@/pages/AnnouncementsPage'))
const AssessmentsPage = lazy(() => import('@/pages/AssessmentsPage'))
const AssessmentDetailsPage = lazy(() => import('@/pages/AssessmentDetailsPage'))
const BillingPage = lazy(() => import('@/pages/BillingPage'))
const BulkGradesPage = lazy(() => import('@/pages/BulkGradesPage'))
const ClassDetailsPage = lazy(() => import('@/pages/ClassDetailsPage'))
const ClassesPage = lazy(() => import('@/pages/ClassesPage'))
const CoursesPage = lazy(() => import('@/pages/CoursesPage'))
const CourseDetailsPage = lazy(() => import('@/pages/CourseDetailsPage'))
const DepartmentsPage = lazy(() => import('@/pages/DepartmentsPage'))
const DepartmentDetailsPage = lazy(() => import('@/pages/DepartmentDetailsPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const EditAcademicYearPage = lazy(() => import('@/pages/EditAcademicYearPage'))
const EditAnnouncementPage = lazy(() => import('@/pages/EditAnnouncementPage'))
const EditAssessmentPage = lazy(() => import('@/pages/EditAssessmentPage'))
const EditClassPage = lazy(() => import('@/pages/EditClassPage'))
const EditCoursePage = lazy(() => import('@/pages/EditCoursePage'))
const EditDepartmentPage = lazy(() => import('@/pages/EditDepartmentPage'))
const EditGradePage = lazy(() => import('@/pages/EditGradePage'))
const EditRolePage = lazy(() => import('@/pages/EditRolePage'))
const EditSemesterPage = lazy(() => import('@/pages/EditSemesterPage'))
const EditStudentPage = lazy(() => import('@/pages/EditStudentPage'))
const EditSubjectPage = lazy(() => import('@/pages/EditSubjectPage'))
const EditUserPage = lazy(() => import('@/pages/EditUserPage'))
const GradeDetailsPage = lazy(() => import('@/pages/GradeDetailsPage'))
const GradesPage = lazy(() => import('@/pages/GradesPage'))
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
/* Website-builder workspace â€” the normal authenticated product experience. */
const MyWebsitesPage = lazy(() => import('@/pages/MyWebsitesPage'))
const SiteDetailsPage = lazy(() => import('@/pages/SiteDetailsPage'))
const SiteEditorPage = lazy(() => import('@/pages/SiteEditorPage'))
const SiteSettingsPage = lazy(() => import('@/pages/SiteSettingsPage'))
const CreateWebsitePage = lazy(() => import('@/pages/CreateWebsitePage'))
const TemplatesPage = lazy(() => import('@/pages/TemplatesPage'))
const AccountPage = lazy(() => import('@/pages/AccountPage'))
const AccountProfilePage = lazy(() => import('@/pages/AccountProfilePage'))
const MarkAttendancePage = lazy(() => import('@/pages/MarkAttendancePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const OAuthCallbackPage = lazy(() => import('@/pages/OAuthCallbackPage'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const RoleDetailsPage = lazy(() => import('@/pages/RoleDetailsPage'))
const RolesPage = lazy(() => import('@/pages/RolesPage'))
const QrLoginPage = lazy(() => import('@/pages/QrLoginPage'))
const SecurityPage = lazy(() => import('@/pages/SecurityPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const ScheduleDetailsPage = lazy(() => import('@/pages/ScheduleDetailsPage'))
const SchedulesPage = lazy(() => import('@/pages/SchedulesPage'))
const AddScheduleEntryPage = lazy(() => import('@/pages/AddScheduleEntryPage'))
const EditScheduleEntryPage = lazy(() => import('@/pages/EditScheduleEntryPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const SessionExpiredPage = lazy(() => import('@/pages/SessionExpiredPage'))
const StudentDetailsPage = lazy(() => import('@/pages/StudentDetailsPage'))
const StudentsPage = lazy(() => import('@/pages/StudentsPage'))
const SubjectsPage = lazy(() => import('@/pages/SubjectsPage'))
const SubjectDetailsPage = lazy(() => import('@/pages/SubjectDetailsPage'))
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'))
const UserDetailsPage = lazy(() => import('@/pages/UserDetailsPage'))
const UsersPage = lazy(() => import('@/pages/UsersPage'))

function RouteFallback() {
  const { t } = useTranslation()
  return (
    <div className="page-status">
      <span className="spinner" aria-hidden="true" />
      {t('common.loading')}
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<AuthLayout />}>
            <Route index element={<LoginPage />} />
            {/* Secondary QR sign-in. It reuses the same auth shell and never
                starts a session on its own â€” the backend decides that. */}
            <Route path="qr" element={<QrLoginPage />} />
          </Route>
          {/* Administration entry point. Unlisted on purpose: the landing page,
              the public login and registration never link here. */}
          <Route path="admin/login" element={<AuthLayout />}>
            <Route index element={<AdminLoginPage />} />
          </Route>
          <Route path="register" element={<AuthLayout />}>
            <Route index element={<RegisterPage />} />
          </Route>
          <Route path="forgot-password" element={<AuthLayout />}>
            <Route index element={<ForgotPasswordPage />} />
          </Route>
          <Route path="reset-password" element={<AuthLayout />}>
            <Route index element={<ResetPasswordPage />} />
          </Route>
          {/* Public redirect target for the future backend OAuth flow. It never
              renders a token and never trusts an off-site return path. */}
          <Route path="auth/callback" element={<AuthLayout />}>
            <Route index element={<OAuthCallbackPage />} />
          </Route>
          <Route path="session-expired" element={<SessionExpiredPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          <Route element={<BillingLayout />}>
            <Route path="billing" element={<BillingPage />} />
          </Route>

          <Route element={<SecurityLayout />}>
            <Route path="security" element={<SecurityPage />} />
          </Route>

          {/* â”€â”€ Website-builder workspace â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              The default product experience. Available to every
              authenticated platform user, including admins who also
              work on their own sites.

              /sites is the workspace home. /dashboard is kept only as a
              compatibility redirect so older links still resolve. */}
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to={SITES_PATH} replace />} />
            <Route
              path="dashboard"
              element={<Navigate to={SITES_PATH} replace />}
            />
            <Route path="sites" element={<MyWebsitesPage />} />
            <Route path="sites/new" element={<CreateWebsitePage />} />
            <Route path="sites/:siteId" element={<SiteDetailsPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="account/profile" element={<AccountProfilePage />} />
          </Route>

          {/* ── Site editor and site settings ────────────────────────────────
              Full-bleed workspaces with their own chrome, so they sit outside
              MainLayout. They stay under the authenticated /sites prefix, which
              is what keeps portal authorisation unchanged.

              Settings shares this layout with the editor on purpose: both are
              about one project rather than about the account, and both need the
              same dark chrome. It also means a project keeps one place to reach
              its content and its configuration from. */}
          <Route element={<SiteEditorLayout />}>
            <Route path="sites/:siteId/editor" element={<SiteEditorPage />} />
            <Route path="sites/:siteId/settings" element={<SiteSettingsPage />} />
          </Route>

          {/* â”€â”€ Legacy academic administration area â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              Isolated behind its own route group and only reachable by
              the internal admin role. Kept working during the pivot so
              nothing breaks; it is not part of the public product. */}
          <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<MainLayout />}>
            <Route path="admin" element={<Navigate to="/users" replace />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="students/new" element={<AddStudentPage />} />
            <Route path="students/:id" element={<StudentDetailsPage />} />
            <Route path="students/:id/edit" element={<EditStudentPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/new" element={<AddCoursePage />} />
            <Route path="courses/:id" element={<CourseDetailsPage />} />
            <Route path="courses/:id/edit" element={<EditCoursePage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="classes/new" element={<AddClassPage />} />
            <Route path="classes/:id" element={<ClassDetailsPage />} />
            <Route path="classes/:id/edit" element={<EditClassPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="departments/new" element={<AddDepartmentPage />} />
            <Route path="departments/:id" element={<DepartmentDetailsPage />} />
            <Route path="departments/:id/edit" element={<EditDepartmentPage />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="subjects/new" element={<AddSubjectPage />} />
            <Route path="subjects/:id" element={<SubjectDetailsPage />} />
            <Route path="subjects/:id/edit" element={<EditSubjectPage />} />
            <Route path="academic-years" element={<AcademicYearsPage />} />
            <Route path="academic-years/new" element={<AddAcademicYearPage />} />
            <Route path="academic-years/:id" element={<AcademicYearDetailsPage />} />
            <Route path="academic-years/:id/edit" element={<EditAcademicYearPage />} />
            <Route
              path="academic-years/:id/semesters/new"
              element={<AddSemesterPage />}
            />
            <Route
              path="academic-years/:id/semesters/:semesterId/edit"
              element={<EditSemesterPage />}
            />
            <Route path="schedules" element={<SchedulesPage />} />
            <Route path="schedules/new" element={<AddScheduleEntryPage />} />
            <Route path="schedules/:id" element={<ScheduleDetailsPage />} />
            <Route path="schedules/:id/edit" element={<EditScheduleEntryPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="announcements/new" element={<AddAnnouncementPage />} />
            <Route path="announcements/:id" element={<AnnouncementDetailsPage />} />
            <Route path="announcements/:id/edit" element={<EditAnnouncementPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="assessments/new" element={<AddAssessmentPage />} />
            <Route path="assessments/:id" element={<AssessmentDetailsPage />} />
            <Route path="assessments/:id/edit" element={<EditAssessmentPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="attendance/mark" element={<MarkAttendancePage />} />
            <Route path="grades" element={<GradesPage />} />
            <Route path="grades/new" element={<AddGradePage />} />
            <Route path="grades/bulk" element={<BulkGradesPage />} />
            <Route path="grades/:id" element={<GradeDetailsPage />} />
            <Route path="grades/:id/edit" element={<EditGradePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/new" element={<AddUserPage />} />
            <Route path="users/:id" element={<UserDetailsPage />} />
            <Route path="users/:id/edit" element={<EditUserPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="roles/new" element={<AddRolePage />} />
            <Route path="roles/:id" element={<RoleDetailsPage />} />
            <Route path="roles/:id/edit" element={<EditRolePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          </Route>
          <Route path="403" element={<UnauthorizedPage />} />
          <Route path="student/*" element={<Navigate to={SITES_PATH} replace />} />
          <Route path="teacher/*" element={<Navigate to={SITES_PATH} replace />} />


        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
