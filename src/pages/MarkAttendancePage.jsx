import { useEffect } from 'react'
import { Save } from 'lucide-react'
import Card from '@/components/common/Card'
import AttendanceBulkActions from '@/components/attendance/AttendanceBulkActions'
import AttendanceMarkingTable from '@/components/attendance/AttendanceMarkingTable'
import AttendanceSessionSelector from '@/components/attendance/AttendanceSessionSelector'
import useAttendanceMarking from '@/hooks/useAttendanceMarking'
import useClasses from '@/hooks/useClasses'

const UNLOADED_HINT = {
  title: 'Select a class to load students',
  text: 'Choose a class and a date, then press Load Students to view the roster.',
}

const UNAVAILABLE_HINT = {
  title: 'Student data is unavailable',
  text: 'Student data will be available when the backend API is connected.',
}

function MarkAttendancePage() {
  const {
    selectedClassId,
    selectedDate,
    handleClassChange,
    handleDateChange,
    rows,
    isLoadingStudents,
    loadError,
    unavailable,
    loadStudents,
    updateRow,
    markAllPresent,
    markAllAbsent,
    resetAll,
    isSaving,
    saveError,
    validationMessage,
    savedSuccessfully,
    dirty,
    save,
  } = useAttendanceMarking()
  const { classes, isLoading: classesLoading } = useClasses()

  useEffect(() => {
    if (!dirty) {
      return undefined
    }
    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirty])

  const hasLoadedRows = rows.length > 0
  const emptyHint = unavailable ? UNAVAILABLE_HINT : UNLOADED_HINT

  return (
    <div className="mark-attendance-page">
      <p className="page-description">
        Mark daily attendance for a class. Select the class and date, load the
        roster, update each student's status, then save.
      </p>

      <Card title="Step 1 · Attendance Session">
        <AttendanceSessionSelector
          classes={classes}
          classesLoading={classesLoading}
          selectedClassId={selectedClassId}
          onClassChange={handleClassChange}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onLoad={loadStudents}
          isLoadingStudents={isLoadingStudents}
        />
        {loadError ? (
          <div className="form__error-area" role="alert">
            {loadError}
          </div>
        ) : null}
      </Card>

      <Card title="Step 2 · Students">
        {hasLoadedRows ? (
          <AttendanceBulkActions
            disabled={isSaving}
            onMarkAllPresent={markAllPresent}
            onMarkAllAbsent={markAllAbsent}
            onResetAll={resetAll}
          />
        ) : null}

        <AttendanceMarkingTable
          rows={rows}
          isLoading={isLoadingStudents}
          emptyHint={emptyHint}
          onUpdateRow={updateRow}
          isSaving={isSaving}
        />

        {hasLoadedRows ? (
          <div className="attendance-save">
            {savedSuccessfully ? (
              <p className="attendance-save__success">
                Attendance saved successfully.
              </p>
            ) : null}
            {validationMessage ? (
              <p className="form__error">{validationMessage}</p>
            ) : null}
            {saveError ? (
              <div className="form__error-area" role="alert">
                {saveError}
              </div>
            ) : null}
            {dirty ? (
              <p className="attendance-save__dirty">
                You have unsaved changes.
              </p>
            ) : null}
            <button
              type="button"
              className="btn btn--primary btn--icon-left"
              onClick={save}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Saving&hellip;
                </>
              ) : (
                <>
                  <Save size={16} aria-hidden="true" />
                  Save Attendance
                </>
              )}
            </button>
          </div>
        ) : null}
      </Card>
    </div>
  )
}

export default MarkAttendancePage