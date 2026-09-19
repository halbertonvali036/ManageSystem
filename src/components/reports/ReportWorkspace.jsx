import { ArrowLeft } from 'lucide-react'
import Card from '@/components/common/Card'
import ReportFilters from '@/components/reports/ReportFilters'
import ReportResult from '@/components/reports/ReportResult'
import useGenerateReport from '@/hooks/useGenerateReport'

function ReportWorkspace({ category, onBack }) {
  const {
    filters,
    setFilter,
    resetFilters,
    status,
    report,
    error,
    generate,
    isGenerating,
  } = useGenerateReport(category.key)

  return (
    <div className="report-workspace">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          All Reports
        </button>
      </div>

      <p className="page-description">{category.description}</p>

      <Card title="Configure Report">
        <ReportFilters
          categoryKey={category.key}
          filters={filters}
          onChange={setFilter}
          onReset={resetFilters}
          onGenerate={generate}
          isGenerating={isGenerating}
        />
      </Card>

      <ReportResult
        status={status}
        report={report}
        error={error}
        onRetry={generate}
      />
    </div>
  )
}

export default ReportWorkspace