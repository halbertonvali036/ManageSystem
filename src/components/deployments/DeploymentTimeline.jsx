import useTranslation from '@/hooks/useTranslation'
import {
  DEPLOYMENT_STATUS,
  isPendingDeployment,
} from '@/models/deployment'

/**
 * The stages a deployment passes through, with the ones it actually reached ticked.
 *
 * The timeline is read from the reported state and the supplied timestamps — it does
 * not animate or advance on a timer. A build the backend has not finished therefore
 * shows no finish time, rather than a progress bar that completes on its own and
 * implies a deployment that did not happen.
 *
 * Stages reached by jumping past others (a queue that never built) render as skipped
 * so the gaps are visible instead of implied.
 */
const STAGES = Object.freeze([
  {
    key: DEPLOYMENT_STATUS.QUEUED,
    labelKey: 'workspaceDeployments.timeline.queued',
  },
  {
    key: DEPLOYMENT_STATUS.BUILDING,
    labelKey: 'workspaceDeployments.timeline.building',
  },
  {
    key: DEPLOYMENT_STATUS.LIVE,
    labelKey: 'workspaceDeployments.timeline.live',
  },
])

/** The order a healthy deployment moves through, used to place a state on the track. */
const STAGE_ORDER = Object.freeze({
  [DEPLOYMENT_STATUS.DRAFT]: -1,
  [DEPLOYMENT_STATUS.QUEUED]: 0,
  [DEPLOYMENT_STATUS.BUILDING]: 1,
  [DEPLOYMENT_STATUS.LIVE]: 2,
  [DEPLOYMENT_STATUS.FAILED]: 2,
  [DEPLOYMENT_STATUS.STOPPED]: 1,
})

function DeploymentTimeline({ deployment }) {
  const { t } = useTranslation()

  if (!deployment) return null

  const currentIndex = STAGE_ORDER[deployment.status] ?? -1
  const isRunning = isPendingDeployment(deployment.status)
  const isFailed = deployment.status === DEPLOYMENT_STATUS.FAILED
  const isStopped = deployment.status === DEPLOYMENT_STATUS.STOPPED

  // A failed or stopped build never reached `live`, so that stage is reported as
  // skipped rather than left to look like it is still ahead.
  const didNotFinish = isFailed || isStopped
  const reachedIndex = didNotFinish
    ? Math.min(currentIndex, STAGES.length - 2)
    : currentIndex

  return (
    <ol className="dep-timeline">
      {STAGES.map((stage, index) => {
        const isReached = index <= reachedIndex
        const isSkipped = !isReached
        const timestamp =
          index === 0
            ? deployment.createdAt
            : index === 1
              ? deployment.startedAt
              : deployment.finishedAt

        return (
          <li
            className={`dep-timeline__step${isReached ? ' dep-timeline__step--reached' : ''}${
              isSkipped ? ' dep-timeline__step--skipped' : ''
            }`}
            key={stage.key}
            aria-current={index === currentIndex && isRunning ? 'step' : undefined}
          >
            <span className="dep-timeline__dot" aria-hidden="true" />
            <span className="dep-timeline__label">{t(stage.labelKey)}</span>
            {isReached && timestamp ? (
              <time className="dep-timeline__time" dateTime={timestamp}>
                {timestamp}
              </time>
            ) : null}
            {isSkipped ? (
              <span className="dep-timeline__note">
                {t('workspaceDeployments.timeline.skipped')}
              </span>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

export default DeploymentTimeline
