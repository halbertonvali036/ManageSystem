import { useMemo, useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import { ADMIN_PLANS, ADMIN_PLAN } from '@/models/adminPlan'
import { BackendNotConnectedError, RequestError } from '@/services/httpClient'
import adminPlatformService from '@/services/adminPlatformService'

function AdminPlanManager({ users = [], refresh }) {
  const { t } = useTranslation()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [targetPlan, setTargetPlan] = useState(ADMIN_PLAN.FREE)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  const usersList = useMemo(() => (Array.isArray(users) ? users : []), [users])
  const selectedUser = usersList.find((u) => String(u.id) === String(selectedUserId)) ?? null
  const currentPlan = typeof selectedUser?.plan === 'string' ? selectedUser.plan : null

  const hasBackendData = usersList.length > 0

  const handleChangePlan = async () => {
    if (!selectedUser) {
      setMessage({ type: 'error', text: t('admin.userActionsHint') })
      return
    }
    setBusy(true)
    setMessage(null)
    try {
      await adminPlatformService.assignUserPlan(selectedUser.id, targetPlan)
      setMessage({ type: 'done', text: t('admin.statusUpdated') })
      if (typeof refresh === 'function') await refresh()
    } catch (error) {
      if (error instanceof BackendNotConnectedError) {
        setMessage({ type: 'unavailable', text: t('admin.planChangeNoBackend') })
      } else {
        setMessage({ type: 'error', text: error instanceof RequestError ? error.message : t('admin.planChangeFailed') })
      }
    } finally {
      setBusy(false)
      setConfirming(false)
    }
  }

  return (
    <section className="admin-foundation" aria-labelledby="admin-plan-assignment">
      <h2 id="admin-plan-assignment">{t('admin.userPlanAssignment')}</h2>
      <p>{t('admin.assignmentHint')}</p>
      <div className="admin-settings-grid">
        <div className="form__field">
          <label htmlFor="admin-plan-user">{t('admin.selectUser')}</label>
          <select
            id="admin-plan-user"
            className="editor-input"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">{t('admin.selectUser')}</option>
            {usersList.map((u) => (
              <option key={u.id} value={u.id}>
                {(u.name || u.fullName || u.email) + (u.email ? ` — ${u.email}` : '')}
              </option>
            ))}
          </select>
        </div>
        <div className="form__field">
          <label htmlFor="admin-plan-current">{t('admin.currentPlan')}</label>
          <input
            id="admin-plan-current"
            className="editor-input"
            value={currentPlan === 'pro' ? t('admin.plans.pro.name') : currentPlan === 'free' ? t('admin.plans.free.name') : t('admin.notSet')}
            readOnly
          />
        </div>
        <div className="form__field">
          <label htmlFor="admin-plan-target">{t('admin.selectPlan')}</label>
          <select
            id="admin-plan-target"
            className="editor-input"
            value={targetPlan}
            onChange={(e) => setTargetPlan(e.target.value)}
          >
            {ADMIN_PLANS.map((p) => (
              <option key={p.id} value={p.id}>{t(p.nameKey)}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="admin-pending-actions">
        <button
          type="button"
          className="btn btn--outline"
          disabled={!hasBackendData || !selectedUser || confirming || busy}
          onClick={() => { setConfirming(true); setMessage(null) }}
        >
          {t('admin.changePlan')}
        </button>
      </div>
      {confirming && (
        <div className="admin-data-state" role="alert">
          <div>
            <strong>{t('admin.confirmPlanTitle')}</strong>
            <p>{t('admin.confirmPlanMessage', { user: selectedUser ? (selectedUser.name || selectedUser.email) : '' })}</p>
          </div>
          <button type="button" className="btn btn--outline" onClick={handleChangePlan} disabled={busy}>{busy ? t('common.loading') : t('common.confirm')}</button>
          <button type="button" className="btn" onClick={() => { setConfirming(false); setBusy(false) }} disabled={busy}>{t('common.cancel')}</button>
        </div>
      )}
      {message && (
        <p className={`admin-hint admin-hint--${message.type}`}>{message.text}</p>
      )}
      {!hasBackendData && (
        <p className="admin-hint">{t('admin.planChangeNoBackend')}</p>
      )}
    </section>
  )
}

export default AdminPlanManager
