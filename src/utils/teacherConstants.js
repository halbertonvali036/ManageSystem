import {
  Award,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  School,
  UserCircle,
} from 'lucide-react'

export const TEACHER_PORTAL_LABEL = 'Teacher'
export const TEACHER_PORTAL_TITLE = 'Student Management System - Teacher'

export const TEACHER_NAV_ITEMS = [
  { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard, section: 'Overview' },
  { label: 'My Classes', path: '/teacher/classes', icon: School, section: 'Teaching' },
  { label: 'My Students', path: '/teacher/students', icon: GraduationCap },
  { label: 'Attendance', path: '/teacher/attendance', icon: ClipboardCheck },
  { label: 'Grades', path: '/teacher/grades', icon: Award },
  { label: 'Schedule', path: '/teacher/schedule', icon: CalendarDays },
  { label: 'Profile', path: '/teacher/profile', icon: UserCircle, section: 'Account' },
]