import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import MainLayout from '@/layouts/MainLayout'
import NotificationsLayout from '@/layouts/NotificationsLayout'
import StudentLayout from '@/layouts/StudentLayout'
import TeacherLayout from '@/layouts/TeacherLayout'
import ProtectedRoute from '@/routes/ProtectedRoute'
import PublicRoute from '@/routes/PublicRoute'

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
const AddTeacherPage = lazy(() => import('@/pages/AddTeacherPage'))
const AddUserPage = lazy(() => import('@/pages/AddUserPage'))
const AttendancePage = lazy(() => import('@/pages/AttendancePage'))
const AcademicYearDetailsPage = lazy(() => import('@/pages/AcademicYearDetailsPage'))
const AcademicYearsPage = lazy(() => import('@/pages/AcademicYearsPage'))
const AnnouncementDetailsPage = lazy(() => import('@/pages/AnnouncementDetailsPage'))
const AnnouncementsPage = lazy(() => import('@/pages/AnnouncementsPage'))
const AssessmentsPage = lazy(() => import('@/pages/AssessmentsPage'))
const AssessmentDetailsPage = lazy(() => import('@/pages/AssessmentDetailsPage'))
const BulkGradesPage = lazy(() => import('@/pages/BulkGradesPage'))
const ClassDetailsPage = lazy(() => import('@/pages/ClassDetailsPage'))
const ClassesPage = lazy(() => import('@/pages/ClassesPage'))
const CoursesPage = lazy(() => import('@/pages/CoursesPage'))
const CourseDetailsPage = lazy(() => import('@/pages/CourseDetailsPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
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
const EditTeacherPage = lazy(() => import('@/pages/EditTeacherPage'))
const EditUserPage = lazy(() => import('@/pages/EditUserPage'))
const GradeDetailsPage = lazy(() => import('@/pages/GradeDetailsPage'))
const GradesPage = lazy(() => import('@/pages/GradesPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const MarkAttendancePage = lazy(() => import('@/pages/MarkAttendancePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))
const RoleDetailsPage = lazy(() => import('@/pages/RoleDetailsPage'))
const RolesPage = lazy(() => import('@/pages/RolesPage'))
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
const TeacherDetailsPage = lazy(() => import('@/pages/TeacherDetailsPage'))
const TeachersPage = lazy(() => import('@/pages/TeachersPage'))
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'))
const UserDetailsPage = lazy(() => import('@/pages/UserDetailsPage'))
const UsersPage = lazy(() => import('@/pages/UsersPage'))
const TeacherAttendancePage = lazy(() => import('@/pages/teacher/TeacherAttendancePage'))
const TeacherClassesPage = lazy(() => import('@/pages/teacher/TeacherClassesPage'))
const TeacherClassDetailsPage = lazy(() => import('@/pages/teacher/TeacherClassDetailsPage'))
const TeacherDashboardPage = lazy(() => import('@/pages/teacher/TeacherDashboardPage'))
const TeacherMarkAttendancePage = lazy(() => import('@/pages/teacher/TeacherMarkAttendancePage'))
const TeacherPlaceholderPage = lazy(() => import('@/pages/teacher/TeacherPlaceholderPage'))
const TeacherGradesPage = lazy(() => import('@/pages/teacher/TeacherGradesPage'))
const TeacherAddGradePage = lazy(() => import('@/pages/teacher/TeacherAddGradePage'))
const TeacherBulkGradesPage = lazy(() => import('@/pages/teacher/TeacherBulkGradesPage'))
const TeacherAssessmentsPage = lazy(() => import('@/pages/teacher/TeacherAssessmentsPage'))
const TeacherAssessmentDetailsPage = lazy(() => import('@/pages/teacher/TeacherAssessmentDetailsPage'))
const TeacherSchedulePage = lazy(() => import('@/pages/teacher/TeacherSchedulePage'))
const TeacherAnnouncementsPage = lazy(() => import('@/pages/teacher/TeacherAnnouncementsPage'))
const TeacherStudentDetailsPage = lazy(() => import('@/pages/teacher/TeacherStudentDetailsPage'))
const TeacherStudentsPage = lazy(() => import('@/pages/teacher/TeacherStudentsPage'))
const StudentDashboardPage = lazy(() => import('@/pages/student/StudentDashboardPage'))
const StudentCoursesPage = lazy(() => import('@/pages/student/StudentCoursesPage'))
const StudentCourseDetailsPage = lazy(() => import('@/pages/student/StudentCourseDetailsPage'))
const StudentClassesPage = lazy(() => import('@/pages/student/StudentClassesPage'))
const StudentClassDetailsPage = lazy(() => import('@/pages/student/StudentClassDetailsPage'))
const StudentSchedulePage = lazy(() => import('@/pages/student/StudentSchedulePage'))
const StudentAttendancePage = lazy(() => import('@/pages/student/StudentAttendancePage'))
const StudentAttendanceDetailsPage = lazy(() => import('@/pages/student/StudentAttendanceDetailsPage'))
const StudentGradesPage = lazy(() => import('@/pages/student/StudentGradesPage'))
const StudentAssessmentsPage = lazy(() => import('@/pages/student/StudentAssessmentsPage'))
const StudentAnnouncementsPage = lazy(() => import('@/pages/student/StudentAnnouncementsPage'))
const StudentGradeDetailsPage = lazy(() => import('@/pages/student/StudentGradeDetailsPage'))
const StudentProfilePage = lazy(() => import('@/pages/student/StudentProfilePage'))
const StudentEditProfilePage = lazy(() => import('@/pages/student/StudentEditProfilePage'))
const StudentChangePasswordPage = lazy(() => import('@/pages/student/StudentChangePasswordPage'))

function RouteFallback() {
  return (
    <div className="page-status">
      <span className="spinner" aria-hidden="true" />
      Loading&hellip;
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="login" element={<AuthLayout />}>
            <Route index element={<LoginPage />} />
          </Route>
          <Route path="forgot-password" element={<AuthLayout />}>
            <Route index element={<ForgotPasswordPage />} />
          </Route>
          <Route path="reset-password" element={<AuthLayout />}>
            <Route index element={<ResetPasswordPage />} />
          </Route>
          <Route path="session-expired" element={<SessionExpiredPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<NotificationsLayout />}>
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="students/new" element={<AddStudentPage />} />
            <Route path="students/:id" element={<StudentDetailsPage />} />
            <Route path="students/:id/edit" element={<EditStudentPage />} />
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="teachers/new" element={<AddTeacherPage />} />
            <Route path="teachers/:id" element={<TeacherDetailsPage />} />
            <Route path="teachers/:id/edit" element={<EditTeacherPage />} />
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
            <Route path="403" element={<UnauthorizedPage />} />
          </Route>

          <Route element={<TeacherLayout />}>
            <Route path="teacher" element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="teacher/dashboard" element={<TeacherDashboardPage />} />
            <Route path="teacher/classes" element={<TeacherClassesPage />} />
            <Route path="teacher/classes/:id" element={<TeacherClassDetailsPage />} />
            <Route path="teacher/students" element={<TeacherStudentsPage />} />
            <Route path="teacher/students/:id" element={<TeacherStudentDetailsPage />} />
            <Route path="teacher/attendance" element={<TeacherAttendancePage />} />
            <Route path="teacher/attendance/mark" element={<TeacherMarkAttendancePage />} />
            <Route path="teacher/grades" element={<TeacherGradesPage />} />
            <Route path="teacher/grades/new" element={<TeacherAddGradePage />} />
            <Route path="teacher/grades/bulk" element={<TeacherBulkGradesPage />} />
            <Route path="teacher/assessments" element={<TeacherAssessmentsPage />} />
            <Route
              path="teacher/assessments/:id"
              element={<TeacherAssessmentDetailsPage />}
            />
            <Route path="teacher/schedule" element={<TeacherSchedulePage />} />
            <Route path="teacher/announcements" element={<TeacherAnnouncementsPage />} />
            <Route
              path="teacher/profile"
              element={
                <TeacherPlaceholderPage
                  title="Profile"
                  description="Manage your profile and account details."
                />
              }
            />
          </Route>

          <Route element={<StudentLayout />}>
            <Route path="student" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="student/dashboard" element={<StudentDashboardPage />} />
            <Route path="student/courses" element={<StudentCoursesPage />} />
            <Route
              path="student/courses/:id"
              element={<StudentCourseDetailsPage />}
            />
            <Route path="student/classes" element={<StudentClassesPage />} />
            <Route
              path="student/classes/:id"
              element={<StudentClassDetailsPage />}
            />
            <Route path="student/schedule" element={<StudentSchedulePage />} />
            <Route
              path="student/attendance"
              element={<StudentAttendancePage />}
            />
            <Route
              path="student/attendance/:id"
              element={<StudentAttendanceDetailsPage />}
            />
            <Route path="student/grades" element={<StudentGradesPage />} />
            <Route
              path="student/grades/:id"
              element={<StudentGradeDetailsPage />}
            />
            <Route
              path="student/assessments"
              element={<StudentAssessmentsPage />}
            />
            <Route
              path="student/announcements"
              element={<StudentAnnouncementsPage />}
            />
            <Route
              path="student/profile"
              element={<StudentProfilePage />}
            />
            <Route
              path="student/profile/edit"
              element={<StudentEditProfilePage />}
            />
            <Route
              path="student/profile/change-password"
              element={<StudentChangePasswordPage />}
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes