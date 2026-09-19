export const toUserFormValues = (initial = {}) => ({
  fullName: initial.fullName ?? initial.name ?? '',
  email: initial.email ?? '',
  username: initial.username ?? '',
  roleId: initial.roleId ?? initial.role?.id ?? '',
  status: initial.status ?? '',
})

export const toUserPayload = (values) => ({
  fullName: values.fullName.trim(),
  email: values.email.trim(),
  username: values.username.trim() || null,
  roleId: values.roleId || null,
  status: values.status,
})