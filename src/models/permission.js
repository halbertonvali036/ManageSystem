export const PERMISSION_CATEGORIES = Object.freeze([
  { id: 'students', label: 'Students' },
  { id: 'teachers', label: 'Teachers' },
  { id: 'courses', label: 'Courses' },
  { id: 'classes', label: 'Classes' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'grades', label: 'Grades' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
  { id: 'users', label: 'Users' },
  { id: 'roles', label: 'Roles' },
])

export const PERMISSION_OPERATIONS = Object.freeze({
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
})

export const PERMISSION_OPERATION_LABELS = Object.freeze({
  [PERMISSION_OPERATIONS.VIEW]: 'View',
  [PERMISSION_OPERATIONS.CREATE]: 'Create',
  [PERMISSION_OPERATIONS.EDIT]: 'Edit',
  [PERMISSION_OPERATIONS.DELETE]: 'Delete',
})

export const createPermissionKey = (categoryId, operation) =>
  `${categoryId}:${operation}`