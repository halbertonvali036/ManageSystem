import useTranslation from '@/hooks/useTranslation'
import { isDemoSession } from '@/services/demoSession'

export default function DemoNotice() {
  const { t } = useTranslation()
  return isDemoSession() ? <p className="demo-notice" role="note">{t('demo.notice')}</p> : null
}
