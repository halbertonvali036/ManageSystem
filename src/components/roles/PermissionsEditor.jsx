import { Check, Minus, ShieldAlert } from 'lucide-react'
import {
  PERMISSION_CATEGORIES,
  PERMISSION_OPERATIONS,
  PERMISSION_OPERATION_LABELS,
} from '@/models/permission'

const OPERATIONS = [
  PERMISSION_OPERATIONS.VIEW,
  PERMISSION_OPERATIONS.CREATE,
  PERMISSION_OPERATIONS.EDIT,
  PERMISSION_OPERATIONS.DELETE,
]

const hasPermission = (permissions, categoryId, operation) => {
  const row = permissions?.[categoryId]
  if (Array.isArray(row)) {
    return row.includes(operation)
  }
  if (row && typeof row === 'object') {
    return Boolean(row[operation])
  }
  return false
}

const rowIsFullyGranted = (permissions, categoryId) =>
  OPERATIONS.every((operation) =>
    hasPermission(permissions, categoryId, operation),
  )

const toRowValue = (permissions, categoryId) => {
  const row = permissions?.[categoryId]
  return Array.isArray(row) ? row : (row ?? {})
}

const buildNext = (permissions, categoryId, operation, granted) => ({
  ...permissions,
  [categoryId]: {
    ...toRowValue(permissions, categoryId),
    [operation]: granted,
  },
})

const buildRowNext = (permissions, categoryId, granted) => {
  const next = { ...permissions }
  next[categoryId] = granted
    ? OPERATIONS.reduce((acc, operation) => {
        acc[operation] = true
        return acc
      }, {})
    : {}
  return next
}

const countGranted = (permissions) =>
  PERMISSION_CATEGORIES.reduce(
    (sum, category) =>
      sum +
      OPERATIONS.filter((operation) =>
        hasPermission(permissions, category.id, operation),
      ).length,
    0,
  )

function PermissionsEditor({ permissions, onChange, disabled = false, readOnly = false }) {
  const interactive = typeof onChange === 'function'
  const displayOnly = readOnly === true
  const inputDisabled = disabled || !interactive

  const handleChange = (next) => {
    if (interactive && !disabled) {
      onChange(next)
    }
  }

  if (!permissions) {
    return (
      <div className="permissions-editor">
        <div className="permissions-editor__empty-box">
          <ShieldAlert
            className="permissions-editor__empty-icon"
            size={32}
            aria-hidden="true"
          />
          <h3 className="permissions-editor__empty-title">
            Permission assignments are not available yet
          </h3>
          <p className="permissions-editor__empty-text">
            Assigned permissions will load from the backend role data once the
            API is connected.
          </p>
        </div>
      </div>
    )
  }

  const totalSlots = PERMISSION_CATEGORIES.length * OPERATIONS.length
  const granted = countGranted(permissions)
  const fullyGranted = PERMISSION_CATEGORIES.filter((category) =>
    rowIsFullyGranted(permissions, category.id),
  ).length

  const summaryLines = PERMISSION_CATEGORIES.map((category) => {
    const grantedOps = OPERATIONS.filter((operation) =>
      hasPermission(permissions, category.id, operation),
    ).map((operation) => PERMISSION_OPERATION_LABELS[operation].toLowerCase())
    return `${category.label}: ${grantedOps.length > 0 ? grantedOps.join(', ') : 'no operations granted'}`
  }).join('. ')

  return (
    <div className="permissions-editor">
      {displayOnly ? (
        <div className="permissions-editor__summary">
          <span className="permissions-editor__summary-chip permissions-editor__summary-chip--accent">
            {granted} of {totalSlots} operations granted
          </span>
          {fullyGranted > 0 ? (
            <span className="permissions-editor__summary-chip">
              {fullyGranted} module{fullyGranted === 1 ? '' : 's'} fully granted
            </span>
          ) : null}
          <p className="visually-hidden">{summaryLines}</p>
        </div>
      ) : null}
      <div className="table-responsive">
        <table className="permissions-editor__table">
          <thead>
            <tr>
              <th scope="col">Module</th>
              {OPERATIONS.map((operation) => (
                <th key={operation} scope="col">
                  {PERMISSION_OPERATION_LABELS[operation]}
                </th>
              ))}
              <th scope="col" aria-label="All operations">
                All
              </th>
            </tr>
          </thead>
          <tbody>
            {PERMISSION_CATEGORIES.map((category) => {
              const rowGranted = rowIsFullyGranted(permissions, category.id)
              return (
                <tr key={category.id}>
                  <td className="permissions-editor__module">
                    {category.label}
                  </td>
                  {OPERATIONS.map((operation) => {
                    const grantedOp = hasPermission(
                      permissions,
                      category.id,
                      operation,
                    )
                    return (
                      <td key={operation} className="permissions-editor__cell">
                        {displayOnly ? (
                          <span
                            className={`permissions-editor__mark${
                              grantedOp
                                ? ' permissions-editor__mark--on'
                                : ' permissions-editor__mark--off'
                            }`}
                            aria-hidden="true"
                          >
                            {grantedOp ? (
                              <Check size={13} strokeWidth={3} />
                            ) : (
                              <Minus size={13} />
                            )}
                          </span>
                        ) : (
                          <input
                            type="checkbox"
                            className="permissions-editor__checkbox"
                            checked={grantedOp}
                            disabled={inputDisabled}
                            onChange={(event) =>
                              handleChange(
                                buildNext(
                                  permissions,
                                  category.id,
                                  operation,
                                  event.target.checked,
                                ),
                              )
                            }
                            aria-label={`${category.label} ${PERMISSION_OPERATION_LABELS[operation]}`}
                          />
                        )}
                      </td>
                    )
                  })}
                  <td className="permissions-editor__cell">
                    {displayOnly ? (
                      <span
                        className={`permissions-editor__mark${
                          rowGranted
                            ? ' permissions-editor__mark--on'
                            : ' permissions-editor__mark--off'
                        }`}
                        aria-hidden="true"
                      >
                        {rowGranted ? (
                          <Check size={13} strokeWidth={3} />
                        ) : (
                          <Minus size={13} />
                        )}
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        className="permissions-editor__checkbox"
                        checked={rowGranted}
                        disabled={inputDisabled}
                        onChange={(event) =>
                          handleChange(
                            buildRowNext(
                              permissions,
                              category.id,
                              event.target.checked,
                            ),
                          )
                        }
                        aria-label={`${category.label} all operations`}
                      />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PermissionsEditor