import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import PermissionsEditor from '@/components/roles/PermissionsEditor'
import RoleForm from '@/components/roles/RoleForm'
import useRole from '@/hooks/useRole'
import useUpdateRole from '@/hooks/useUpdateRole'
import useUpdateRolePermissions from '@/hooks/useUpdateRolePermissions'
import { BackendNotConnectedError } from '@/services/httpClient'
import { toRoleFormValues } from '@/utils/roleForm'

function RolePermissionsCard({ roleId, initialPermissions }) {
  const [permissions, setPermissions] = useState(initialPermissions)
  const { isSaving, saveError, save } = useUpdateRolePermissions(roleId)
  const [savedFlash, setSavedFlash] = useState(false)

  const handleSave = async () => {
    const result = await save(permissions)
    if (result.ok) {
      setSavedFlash(true)
    }
  }

  return (
    <div className="role-details__permissions">
      <Card title="Permissions">
        <p className="form__hint">
          Assign module-level permissions to this role. Assigned values load
          from the backend role data.
        </p>
        {savedFlash ? (
          <div className="alert alert--success" role="status">
            Permissions updated.
          </div>
        ) : null}
        {saveError ? (
          <div className="form__error-area" role="alert">
            {saveError}
          </div>
        ) : null}
        <PermissionsEditor
          permissions={permissions}
          onChange={setPermissions}
          disabled={isSaving}
        />
        <div className="role-form__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSave}
            disabled={isSaving || !permissions}
          >
            {isSaving ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Saving&hellip;
              </>
            ) : (
              'Save Permissions'
            )}
          </button>
        </div>
      </Card>
    </div>
  )
}

function EditRoleContent({ roleId }) {
  const navigate = useNavigate()
  const { role, isLoading, error, refetch } = useRole(roleId)
  const { isSubmitting, submitError, fieldErrors, submit } =
    useUpdateRole(roleId)

  const handleCancel = () => {
    navigate(`/roles/${roleId}`)
  }

  const handleSubmit = async (payload) => {
    const result = await submit(payload)
    if (result.ok) {
      navigate(`/roles/${roleId}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading role&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Role data is unavailable</h3>
          <p className="table-state__text">
            Role data will be available when the backend API is connected.
          </p>
        </div>
      </Card>
    ) : (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load role</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!role) {
    return null
  }

  return (
    <div className="edit-role-page">
      <p className="page-description">
        Update the role details below and save your changes.
      </p>
      <Card title="Edit Role">
        <RoleForm
          initialValues={toRoleFormValues(role)}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitError={submitError}
          serverFieldErrors={fieldErrors}
        />
      </Card>
      <RolePermissionsCard
        key={role.id}
        roleId={roleId}
        initialPermissions={role.permissions ?? null}
      />
    </div>
  )
}

function EditRolePage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <EditRoleContent key={id} roleId={id} />
}

export default EditRolePage