import { enAccountPolish } from '@/i18n/accountPolishLocales'
import useTranslation from '@/hooks/useTranslation'

// Adapt existing static account metadata to i18n without changing API values.
// Unknown server-supplied text is preserved, never treated as a translation key.
const copyKeys = new Map(Object.entries(enAccountPolish).map(([key, value]) => [value, key]))

export default function useAccountCopy() {
  const { t } = useTranslation()
  return value => copyKeys.has(value) ? t(`accountPolish.${copyKeys.get(value)}`) : value
}
