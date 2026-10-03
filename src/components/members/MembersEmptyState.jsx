import { UserPlus, Users } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'

/**
 * Shown when a workspace has no members to display.
 *
 * Never renders a sample member. A member row is a person, and putting a placeholder
 * name next to a permissions table would read as a real colleague who could be removed
 * or given a role — so the empty state offers the one honest way forward instead: ask
 * the backend to invite somebody.
 *
 * `onInvite` may be absent, in which case the call to action is not rendered rather
 * than rendered as a button that does nothing.
 */
function MembersEmptyState({ onInvite, isBusy = false }) {
  const { t } = useTranslation()

  return (
    <div className="mem-empty">
      <span className="mem-empty__icon" aria-hidden="true">
        <Users size={20} />
      </span>

      <h3 className="mem-empty__title">{t('workspaceMembers.emptyTitle')}</h3>
      <p className="mem-empty__text">{t('workspaceMembers.emptyText')}</p>

      {onInvite ? (
        <button
          type="button"
          className="btn btn--primary mem-empty__cta"
          onClick={onInvite}
          disabled={isBusy}
        >
          <UserPlus size={15} aria-hidden="true" />
          {t('workspaceMembers.invite.submit')}
        </button>
      ) : null}
    </div>
  )
}

export default MembersEmptyState
