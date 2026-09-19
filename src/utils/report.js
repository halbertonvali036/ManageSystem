const normalizeColumn = (entry) => {
  if (typeof entry === 'string') {
    return { key: entry, label: entry }
  }
  return { key: entry?.key ?? '', label: entry?.label ?? entry?.key ?? '' }
}

export const toReportResult = (payload) => {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.rows)
      ? payload.rows
      : []

  let columns = []
  if (Array.isArray(payload?.columns) && payload.columns.length > 0) {
    columns = payload.columns
  } else if (Array.isArray(payload) && payload.length > 0) {
    columns = Object.keys(payload[0] ?? {}).map((key) => key)
  }

  const summary = Array.isArray(payload?.summary) ? payload.summary : null

  return {
    rows,
    columns: columns.map(normalizeColumn),
    summary,
  }
}