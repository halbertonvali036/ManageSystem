import { Link } from 'react-router-dom'
import {
  Cable,
  CreditCard,
  Database,
  Globe,
  HardDrive,
  Link2,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  Zap,
} from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  ACTIVITY_TYPE_GROUP,
  ACTIVITY_TYPE_ICONS,
  ACTIVITY_TYPE_LABEL_KEYS,
  formatActivityDate,
  getActivityDateTime,
} from '@/models/activity'

/** Group → icon. The model names the group; the component owns the icon choice. */
const GROUP_ICONS = {
  [ACTIVITY_TYPE_GROUP.WORKSPACE]: Sparkles,
  [ACTIVITY_TYPE_GROUP.SITE]: Zap,
  [ACTIVITY_TYPE_GROUP.MEMBER]: Users,
  [ACTIVITY_TYPE_GROUP.RECORD]: Database,
  [ACTIVITY_TYPE_GROUP.MODEL]: HardDrive,
  [ACTIVITY_TYPE_GROUP.INTEGRATION]: Cable,
  [ACTIVITY_TYPE_GROUP.DOMAIN]: Globe,
  [ACTIVITY_TYPE_GROUP.DEPLOYMENT]: Rocket,
  [ACTIVITY_TYPE_GROUP.BILLING]: CreditCard,
  [ACTIVITY_TYPE_GROUP.SECURITY]: ShieldCheck,
  [ACTIVITY_TYPE_GROUP.SYSTEM]: Link2,
}

/** Actor + target chips, so a person and an object are never conflated. */
const ROLE_ICONS = { owner: UserCog }

/**
 * One recorded event.
 *
 * Everything on this row was sent by the backend, and each part is allowed to be
 * absent — a deployment has no human actor, a scheduled job may have no target, and
 * an event imported from elsewhere may have no readable time. Absent parts are
 * labelled as absent rather than filled in:
 *
 *  - no actor        → "System", never the signed-in user
 *  - no target       → no chip, never a guess at which object was meant
 *  - no time         → "no time recorded", never "just now"
 *
 * The event's own name is the type label, and the backend's `description` is shown
 * verbatim underneath when it sent one. Nothing here composes a sentence the backend
 * did not report, because a tidy sentence is where a misreport would hide.
 */
function ActivityRow({ event }) {
  const { t, locale } = useTranslation()

  const group = ACTIVITY_TYPE_ICONS[event.type] ?? ACTIVITY_TYPE_GROUP.SYSTEM
  const Icon = GROUP_ICONS[group] ?? Link2

  const displayDate = formatActivityDate(event, locale)
  const dateTime = getActivityDateTime(event)
  const actorName = event.actor?.name || event.actor?.email
  const RoleIcon = event.actor?.role ? ROLE_ICONS[event.actor.role] : null
  const targetLabel = event.target?.label || event.target?.type

  return (
    <li className={`act-row act-row--${group}`}>
      <span className="act-row__icon" aria-hidden="true">
        <Icon size={16} />
      </span>

      <div className="act-row__body">
        <p className="act-row__title">
          {t(ACTIVITY_TYPE_LABEL_KEYS[event.type])}
          {targetLabel ? <span className="act-row__target">{targetLabel}</span> : null}
        </p>

        {/* The backend's own words when it sent them, and nothing in their place. */}
        {event.description ? <p className="act-row__description">{event.description}</p> : null}

        <div className="act-row__meta">
          <span className="act-row__actor">
            {actorName ? (
              <>
                {RoleIcon ? <RoleIcon size={12} aria-hidden="true" /> : null}
                {actorName}
              </>
            ) : (
              t('workspaceActivity.row.systemActor')
            )}
          </span>

          {displayDate ? (
            <time className="act-row__time" dateTime={dateTime ?? undefined}>
              {displayDate}
            </time>
          ) : (
            <span className="act-row__time act-row__time--missing">
              {t('workspaceActivity.row.noTimestamp')}
            </span>
          )}
        </div>
      </div>

      {/* Only rendered when the backend sent a local route; the model drops anything
          that is not one, so a payload cannot inject a link out of the portal. */}
      {event.target?.path ? (
        <Link className="act-row__link" to={event.target.path}>
          {t('workspaceActivity.row.openTarget')}
        </Link>
      ) : null}
    </li>
  )
}

export default ActivityRow
