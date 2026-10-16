/**
 * Cached Intl formatters.
 *
 * Constructing an `Intl.DateTimeFormat` is dramatically more expensive than
 * calling `format()` on one, and the same locale + options combination is
 * rebuilt on every row and every render across lists, tables and timelines.
 * Building each combination once and reusing it removes that repeated work
 * without changing a single formatted value.
 *
 * The cache is keyed by locale and the serialized options object, so different
 * date styles (medium, medium+short, …) each keep their own instance.
 */

const dateFormatterCache = new Map()

/** A cached `Intl.DateTimeFormat` for one locale + options combination. */
export function getDateFormatter(locale, options) {
  const key = `${locale}\u0000${JSON.stringify(options)}`
  let formatter = dateFormatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options)
    dateFormatterCache.set(key, formatter)
  }
  return formatter
}
