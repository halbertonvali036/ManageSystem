import {
  Award,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  School,
  UserCircle,
} from 'lucide-react'

export const STUDENT_PORTAL_LABEL = 'Student'
export const STUDENT_PORTAL_TITLE = 'Student Management System - Student'

export const STUDENT_NAV_ITEMS = [
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard, section: 'Overview' },
  { label: 'My Courses', path: '/student/courses', icon: BookOpen, section: 'Academic' },
  { label: 'My Classes', path: '/student/classes', icon: School },
  { label: 'Schedule', path: '/student/schedule', icon: CalendarDays },
  { label: 'Attendance', path: '/student/attendance', icon: ClipboardCheck },
  { label: 'Grades', path: '/student/grades', icon: Award },
  { label: 'Assessments', path: '/student/assessments', icon: ClipboardList },
  { label: 'Announcements', path: '/student/announcements', icon: Megaphone },
  { label: 'Profile', path: '/student/profile', icon: UserCircle, section: 'Account' },
]