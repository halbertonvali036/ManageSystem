export const toRoleFormValues = (initial = {}) => ({
  name: initial.name ?? initial.roleName ?? '',
  description: initial.description ?? '',
  status: initial.status ?? '',
})

export const toRolePayload = (values) => ({
  name: values.name.trim(),
  description: values.description.trim(),
  status: values.status,
})