import { useCallback, useState } from 'react'
import rolesService from '@/services/rolesService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useUpdateRolePermissions(id) {
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const save = useCallback(
    async (permissions) => {
      setIsSaving(true)
      setSaveError(null)
      try {
        const result = await rolesService.updateRolePermissions(id, permissions)
        return { ok: true, result }
      } catch (error) {
        setSaveError(getSubmitFeedback(error, 'Could not save permissions.').message)
        return { ok: false }
      } finally {
        setIsSaving(false)
      }
    },
    [id],
  )

  return { isSaving, saveError, save }
}

export default useUpdateRolePermissions