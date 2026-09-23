import { Download, FileBarChart2, FileText, ListFilter } from 'lucide-react'
import Card from '@/components/common/Card'

const EXPORT_HINT =
  'Export will be available once the backend is connected and real report data exists.'

function IdleState() {
  return (
    <div className="table-state">
      <FileBarChart2 className="table-state__icon" size={40} aria-hidden="true" />
      <h3 className="table-state__title">No report generated</h3>
      <p className="table-state__text">
        Configure filters and generate a report.
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="page-status" role="status">
      <span className="spinner" aria-hidden="true" />
      Generating report&hellip;
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="table-state">
      <h3 className="table-state__title">Failed to generate report</h3>
      <p className="table-state__text">{message}</p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="table-state">
      <ListFilter className="table-state__icon" size={40} aria-hidden="true" />
      <h3 className="table-state__title">No results</h3>
      <p className="table-state__text">
        No records match the selected filters.
      </p>
    </div>
  )
}

const formatCellValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

function ReportResult({ status, report, error, onRetry }) {
  const hasRows = status === 'ready' && Array.isArray(report?.rows) && report.rows.length > 0
  const hasSummary =
    status === 'ready' && Array.isArray(report?.summary) && report.summary.length > 0

  if (status === 'idle') {
    return (
      <Card>
        <IdleState />
      </Card>
    )
  }

  if (status === 'loading') {
    return (
      <Card>
        <LoadingState />
      </Card>
    )
  }

  if (status === 'error') {
    return (
      <Card>
        <ErrorState message={error} onRetry={onRetry} />
      </Card>
    )
  }

  if (status === 'ready' && !hasRows) {
    return (
      <Card>
        <EmptyState />
      </Card>
    )
  }

  if (status === 'ready' && hasRows) {
    const countLabel = `${report.rows.length} ${report.rows.length === 1 ? 'record' : 'records'}`
    return (
      <Card className="report-result">
        <div className="report-result__header">
          {hasSummary ? (
            <div className="report-result__summary">
              {report.summary.map((item, index) => (
                <div
                  className="report-result__stat"
                  key={item?.key ?? `${item?.label ?? 'stat'}-${index}`}
                >
                  <span className="report-result__stat-value">
                    {item?.value ?? '—'}
                  </span>
                  <span className="report-result__stat-label">
                    {item?.label ?? ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="report-result__count">Results &mdash; {countLabel}</p>
          )}

          <div className="report-result__actions">
            <button type="button" className="btn btn--icon-left" disabled title={EXPORT_HINT}>
              <FileText size={16} aria-hidden="true" />
              Export PDF
            </button>
            <button type="button" className="btn btn--icon-left" disabled title={EXPORT_HINT}>
              <Download size={16} aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="report-result__table">
            <thead>
              <tr>
                {report.columns.map((column) => (
                  <th key={column.key} scope="col">
                    {column.label || column.key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, rowIndex) => (
                <tr key={row.id ?? rowIndex}>
                  {report.columns.map((column) => (
                    <td key={`${rowIndex}-${column.key}`}>
                      {formatCellValue(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    )
  }

  return null
}

export default ReportResult