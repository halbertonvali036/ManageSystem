import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShieldCheck, UserPlus, Users } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceMembers from '@/hooks/useWorkspaceMembers'
import memberService from '@/services/memberService'
import { BackendNotConnectedError } from '@/services/httpClient'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import MemberRow from '@/components/members/MemberRow'
import MembersEmptyState from '@/components/members/MembersEmptyState'
import InviteMemberDialog from '@/components/members/InviteMemberDialog'
import WorkspacePermissionsMatrix from '@/components/members/WorkspacePermissionsMatrix'
import {
  MEMBER_FILTER_ALL,
  MEMBER_ROLES,
  MEMBER_ROLE_LABEL_KEYS,
  MEMBER_STATUSES,
  MEMBER_STATUS_LABEL_KEYS,
  buildMemberRoleDraft,
} from '@/models/member'

/**
 * Workspace Team — the people in this workspace and what each of them may do.
 *
 * The list only ever contains members the backend reported. A workspace with no
 * backend has no members to show, so the page says exactly that: an empty list is the
 * truth, and seeding a sample colleague would put a name next to a permissions table
 * that somebody could then try to remove.
 *
 * Every action here is a request, not a local edit. Nothing is updated optimistically:
 * after a write the list is re-read from the backend, so a refused or unavailable
 * write leaves the page exactly as it was. Inviting in particular cannot report
 * success on its own — the dialog only closes when the backend has confirmed it.
 */
function WorkspaceMembersPage() {
  const { workspaceId } = useParams()
  const { t } = useTranslation()
  const { workspace, isLoading: workspaceLoading } = useWorkspace(workspaceId)

  const {
    members,
    visibleMembers,
    total,
    activeCount,
    invitedCount,
    suspendedCount,
    isLoading,
    error,
    query,
    setQuery,
    role,
    setRole,
    status,
    setStatus,
    isFiltered,
    clearFilters,
    refetch,
  } = useWorkspaceMembers(workspaceId)

  const [isBusy, setIsBusy] = useState(false)
  const [pendingId, setPendingId] = useState(null)
  const [pendingRemoval, setPendingRemoval] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  /**
   * Runs a write and re-reads the list from the backend.
   *
   * `onSuccess` runs only after the request resolved, so a caller that needs to know
   * whether the write happened (the invite dialog, which must not close on a refusal)
   * is told the truth.
   */
  const runAction = async (action, { onSuccess } = {}) => {
    setIsBusy(true)
    setActionError(null)
    try {
      await action()
      setPendingId(null)
      setPendingRemoval(null)
      refetch()
      onSuccess?.()
    } catch (err) {
      setActionError(
        err instanceof BackendNotConnectedError
          ? t('workspaceMembers.unavailableNotice')
          : t('workspaceMembers.actionFailed')
      )
      // Re-thrown so a caller holding its own UI (the invite dialog) can react to the
      // refusal instead of treating a failed write as a finished one.
      throw err
    } finally {
      setIsBusy(false)
    }
  }

  const handleInvite = (draft) =>
    runAction(() => memberService.inviteMember(workspaceId, draft, {
      existingEmails: members.map((member) => member.email),
    }))

  /**
   * Asks the backend to change one role.
   *
   * The draft is checked first so an owner row is never sent, and a selection equal to
   * the current role is a no-op rather than a pointless round trip.
   */
  const handleRoleChange = async (member, nextRole) => {
    setActionError(null)

    const draft = buildMemberRoleDraft({ role: nextRole }, member)
    if (!draft.isValid || !draft.hasChanged) {
      return
    }

    try {
      await runAction(() =>
        memberService.updateMemberRole(member.id, workspaceId, draft.role)
      )
    } catch {
      // runAction already surfaced the reason on the page. The select keeps the role
      // the backend reported, because it renders from `member`, not from the choice.
    }
  }

  const handleResendInvite = (member) => {
    setActionError(null)
    setPendingId(member.id)
    runAction(() => memberService.resendInvite(member.id, workspaceId)).catch(() => {})
  }

  const handleRemove = (member) => {
    setActionError(null)
    setPendingRemoval(member)
  }

  return (
    <div className="workspaces-page mem-page">
      <WorkspaceBreadcrumb workspace={workspace} section="members" />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="workspaces-page__head">
        <div className="workspaces-page__headline">
          <h1 className="workspaces-page__title">
            <Users size={22} aria-hidden="true" />
            {t('workspaceMembers.pageTitle')}
          </h1>
          <p className="page-description">
            {t('workspaceMembers.pageDescription')}
          </p>
        </div>

        <div className="mem-page__head-actions">
          <div className="mem-page__summary" role="status">
            <span className="mem-page__count">
              {t('workspaceMembers.totalCount', { count: total })}
            </span>
            <span className="mem-page__count">
              {t('workspaceMembers.activeCount', { count: activeCount })}
            </span>
            <span className="mem-page__count">
              {t('workspaceMembers.invitedCount', { count: invitedCount })}
            </span>
            {suspendedCount > 0 ? (
              <span className="mem-page__count">
                {t('workspaceMembers.suspendedCount', { count: suspendedCount })}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            className="btn btn--primary mem-page__cta"
            onClick={() => setIsInviteOpen(true)}
            disabled={isBusy}
          >
            <UserPlus size={15} aria-hidden="true" />
            {t('workspaceMembers.invite.submit')}
          </button>
        </div>
      </header>

      <p className="mem-page__notice">
        <ShieldCheck size={14} aria-hidden="true" />
        {t('workspaceMembers.notice')}
      </p>

      {/* A refused write inside a dialog is reported by that dialog, so the page-level
          banner stays out of the way rather than repeating the same sentence behind
          an overlay. Role changes and resends have no dialog, so this is where their
          reason appears. */}
      {actionError && !pendingRemoval && !isInviteOpen ? (
        <div className="form-notice form-notice--error" role="alert">
          {actionError}
        </div>
      ) : null}

      <div className="mem-page__toolbar">
        <div className="db-search">
          <label className="db-search__label" htmlFor="mem-search">
            {t('workspaceMembers.searchLabel')}
          </label>
          <input
            id="mem-search"
            type="search"
            className="form__input db-search__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('workspaceMembers.searchPlaceholder')}
          />
        </div>

        <div className="mem-page__filters">
          <label className="mem-page__filter" htmlFor="mem-role">
            <span className="visually-hidden">
              {t('workspaceMembers.filterRoleLabel')}
            </span>
            <select
              id="mem-role"
              className="form__select"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value={MEMBER_FILTER_ALL}>
                {t('workspaceMembers.filterAllRoles')}
              </option>
              {MEMBER_ROLES.map((item) => (
                <option key={item} value={item}>
                  {t(MEMBER_ROLE_LABEL_KEYS[item])}
                </option>
              ))}
            </select>
          </label>

          <label className="mem-page__filter" htmlFor="mem-status">
            <span className="visually-hidden">
              {t('workspaceMembers.filterStatusLabel')}
            </span>
            <select
              id="mem-status"
              className="form__select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value={MEMBER_FILTER_ALL}>
                {t('workspaceMembers.filterAllStatuses')}
              </option>
              {MEMBER_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {t(MEMBER_STATUS_LABEL_KEYS[item])}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error ? (
        <Card>
          <div className="table-state table-state--error">
            <h3 className="table-state__title">{t('workspaceMembers.loadFailed')}</h3>
            <p className="table-state__text">
              {t('workspaceMembers.loadFailedText')}
            </p>
            <button type="button" className="btn btn--primary" onClick={refetch}>
              {t('common.retry')}
            </button>
          </div>
        </Card>
      ) : isLoading ? (
        <Card>
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('workspaceMembers.loading')}
          </div>
        </Card>
      ) : isFiltered && visibleMembers.length === 0 ? (
        <Card>
          <div className="sites-no-results">
            <h3 className="sites-no-results__title">
              {t('workspaceMembers.noResultsTitle')}
            </h3>
            <p className="sites-no-results__text">
              {t('workspaceMembers.noResultsText')}
            </p>
            <button type="button" className="btn btn--outline" onClick={clearFilters}>
              {t('workspaceMembers.clearFilters')}
            </button>
          </div>
        </Card>
      ) : visibleMembers.length === 0 ? (
        <Card>
          <MembersEmptyState
            onInvite={() => setIsInviteOpen(true)}
            isBusy={isBusy || workspaceLoading}
          />
        </Card>
      ) : (
        <ul className="mem-list">
          {visibleMembers.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isBusy={isBusy || workspaceLoading || pendingId === member.id}
              onRoleChange={handleRoleChange}
              onResendInvite={handleResendInvite}
              onRemove={handleRemove}
            />
          ))}
        </ul>
      )}

      <Card>
        <WorkspacePermissionsMatrix />
      </Card>

      {isInviteOpen ? (
        <InviteMemberDialog
          existingEmails={members.map((member) => member.email)}
          isSubmitting={isBusy}
          onInvite={handleInvite}
          onClose={() => {
            setIsInviteOpen(false)
            setActionError(null)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingRemoval)}
        title={t('workspaceMembers.confirm.removeTitle')}
        message={t('workspaceMembers.confirm.removeText', {
          email: pendingRemoval ? pendingRemoval.email : '',
        })}
        confirmLabel={t('workspaceMembers.row.removeCta')}
        confirmingLabel={t('workspaceMembers.confirm.removing')}
        cancelLabel={t('common.cancel')}
        isConfirming={isBusy}
        error={actionError}
        onConfirm={() =>
          runAction(() =>
            memberService.removeMember(pendingRemoval.id, workspaceId)
          ).catch(() => {})
        }
        onCancel={() => {
          setPendingRemoval(null)
          setActionError(null)
        }}
      />
    </div>
  )
}

export default WorkspaceMembersPage
