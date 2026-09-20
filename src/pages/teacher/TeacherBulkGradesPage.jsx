import { useEffect, useRef } from 'react'
import { Save } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import BulkGradeControls from '@/components/grades/BulkGradeControls'
import BulkGradeTable from '@/components/grades/BulkGradeTable'
import GradingContextSelector from '@/components/grades/GradingContextSelector'
import useMyClasses from '@/hooks/teacher/useMyClasses'
import useMyCourses from '@/hooks/teacher/useMyCourses'
import useTeacherBulkGrades from '@/hooks/teacher/useTeacherBulkGrades'

const UNLOADED_HINT = {
  title: 'Select a class to load students',
  text: 'Choose the grading context, then press Load Students to view the roster.',
}

const UNAVAILABLE_HINT = {
  title: 'Student data is unavailable',
  text: 'Student data will be available when the backend API is connected.',
}

function TeacherBulkGradesPage() {
  const [searchParams] = useSearchParams()
  const { handleContextChange } = useTeacherBulkGrades()
  const prefilledAssessmentRef = useRef(false)

  useEffect(() => {
    const searchParamAssessmentId = searchParams.get('assessmentId')
    if (
      searchParamAssessmentId &&
      !prefilledAssessmentRef.current
    ) {
      prefilledAssessmentRef.current = true
      handleContextChange('assessmentId', searchParamAssessmentId)
    }
  }, [searchParams, handleContextChange])

  const {
    classId,
    courseId,
    assessmentType,
    assessmentName,
    maxScore,
    date,
    rows,
    isLoadingStudents,
    loadError,
    unavailable,
    loadStudents,
    updateRow,
    clearScores,
    resetChanges,
    isSaving,
    saveError,
    validationMessage,
    savedSuccessfully,
    dirty,
    save,
  } = useTeacherBulkGrades()
  const { classes, isLoading: classesLoading } = useMyClasses()
  const { courses, isLoading: coursesLoading } = useMyCourses()

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
    <div className="bulk-grades-page">
      <p className="page-description">
        Grade multiple students for one assessment. Select the grading context,
        load the roster, enter each student&apos;s score, then save.
      </p>

      <Card title="Step 1 · Grading Context">
        <GradingContextSelector
          classes={classes}
          classesLoading={classesLoading}
          courses={courses}
          coursesLoading={coursesLoading}
          classId={classId}
          onClassChange={(value) => handleContextChange('classId', value)}
          courseId={courseId}
          onCourseChange={(value) => handleContextChange('courseId', value)}
          assessmentType={assessmentType}
          onAssessmentTypeChange={(value) =>
            handleContextChange('assessmentType', value)
          }
          assessmentName={assessmentName}
          onAssessmentNameChange={(value) =>
            handleContextChange('assessmentName', value)
          }
          maxScore={maxScore}
          onMaxScoreChange={(value) => handleContextChange('maxScore', value)}
          date={date}
          onDateChange={(value) => handleContextChange('date', value)}
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
          <BulkGradeControls
            disabled={isSaving}
            onClearScores={clearScores}
            onResetChanges={resetChanges}
          />
        ) : null}

        <BulkGradeTable
          rows={rows}
          maxScore={maxScore}
          isLoading={isLoadingStudents}
          emptyHint={emptyHint}
          onUpdateRow={updateRow}
          isSaving={isSaving}
        />

        {hasLoadedRows ? (
          <div className="attendance-save">
            {savedSuccessfully ? (
              <p className="attendance-save__success">
                Grades saved successfully.
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
                  Save Grades
                </>
              )}
            </button>
          </div>
        ) : null}
      </Card>
    </div>
  )
}

export default TeacherBulkGradesPage