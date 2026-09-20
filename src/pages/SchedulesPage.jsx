import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import AdminScheduleCard from '@/components/schedules/AdminScheduleCard'
import SchedulesTable from '@/components/schedules/SchedulesTable'
import SchedulesToolbar from '@/components/schedules/SchedulesToolbar'
import SchedulesViewNav from '@/components/schedules/SchedulesViewNav'
import WeeklyTimetableView from '@/components/schedules/WeeklyTimetableView'
import useAcademicYears from '@/hooks/useAcademicYears'
import useClasses from '@/hooks/useClasses'
import useCourses from '@/hooks/useCourses'
import useDeleteSchedule from '@/hooks/useDeleteSchedule'
import useSchedules from '@/hooks/useSchedules'
import useSemesters from '@/hooks/useSemesters'
import useTeachers from '@/hooks/useTeachers'
import {
  formatScheduleClassName,
  formatScheduleCourseName,
  formatScheduleDayLabel,
  formatScheduleRoom,
} from '@/models/schedule'
import { addDays, formatWeekRangeLabel, getMondayOfWeek, toDateKey } from '@/utils/scheduleDate'

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading schedule entries&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load schedules</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card>
      <div className="table-state">
        <CalendarClock className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No schedule for this period yet</h3>
        <p className="table-state__text">
          No schedule has been created for this period yet. Adjust the filters
          or start adding entries once the data sources are available.
        </p>
      </div>
    </Card>
  )
}

function SchedulesPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('week')
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [search, setSearch] = useState('')
  const [academicYearFilter, setAcademicYearFilter] = useState('all')
  const [semesterFilter, setSemesterFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [teacherFilter, setTeacherFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [dayFilter, setDayFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { academicYears, isLoading: academicYearsLoading } = useAcademicYears()
  const { classes, isLoading: classesLoading } = useClasses()
  const { courses, isLoading: coursesLoading } = useCourses()
  const { teachers, isLoading: teachersLoading } = useTeachers()

  const selectedAcademicYear = academicYears.find(
    (academicYear) => String(academicYear.id) === academicYearFilter,
  )
  const { semesters, isLoading: semestersLoading } = useSemesters(
    selectedAcademicYear?.id,
  )

  const filters = {
    ...(search ? { search } : {}),
    ...(academicYearFilter !== 'all' ? { academicYearId: academicYearFilter } : {}),
    ...(semesterFilter !== 'all' ? { semesterId: semesterFilter } : {}),
    ...(classFilter !== 'all' ? { classId: classFilter } : {}),
    ...(teacherFilter !== 'all' ? { teacherId: teacherFilter } : {}),
    ...(courseFilter !== 'all' ? { courseId: courseFilter } : {}),
    ...(dayFilter !== 'all' ? { dayOfWeek: dayFilter } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { schedules, isLoading, error, refetch } = useSchedules(filters)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const { isDeleting, deleteError, deleteSchedule } = useDeleteSchedule(
    deleteTarget?.id,
  )

  const weekStart = getMondayOfWeek(anchorDate)
  const weekStartKey = toDateKey(weekStart)

  const clearFilters = () => {
    setSearch('')
    setAcademicYearFilter('all')
    setSemesterFilter('all')
    setClassFilter('all')
    setTeacherFilter('all')
    setCourseFilter('all')
    setDayFilter('all')
    setStatusFilter('all')
  }

  const handleAcademicYearChange = (value) => {
    setSemesterFilter('all')
    setAcademicYearFilter(value)
  }

  const handleAdd = () => {
    navigate('/schedules/new')
  }

  const handleView = (entry) => {
    navigate(`/schedules/${entry.id}`)
  }

  const handleEdit = (entry) => {
    navigate(`/schedules/${entry.id}/edit`)
  }

  const handleDeleteRequest = (entry) => {
    setDeleteTarget(entry)
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteTarget(null)
    }
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteSchedule()
    if (result.ok) {
      setDeleteTarget(null)
      refetch()
    }
  }

  const handleOffsetChange = (offset) => {
    if (offset === 0) {
      setAnchorDate(new Date())
      return
    }
    setAnchorDate((current) => addDays(current, offset * 7))
  }

  const handleJumpToWeek = (value) => {
    if (!value) {
      return
    }
    const [year, month, day] = value.split('-').map(Number)
    setAnchorDate(getMondayOfWeek(new Date(year, month - 1, day)))
  }

  return (
    <div className="schedules-page schedule-page">
      <p className="page-description">
        Manage the master timetable for every academic year, semester and
        class. Filter by period, class, teacher, course or day, and switch
        between the weekly timetable and list views.
      </p>

      <SchedulesToolbar
        search={search}
        onSearchChange={setSearch}
        academicYears={academicYears}
        academicYearsLoading={academicYearsLoading}
        academicYearId={academicYearFilter}
        onAcademicYearChange={handleAcademicYearChange}
        semesters={semesters}
        semestersLoading={semestersLoading}
        semesterId={semesterFilter}
        onSemesterChange={setSemesterFilter}
        classes={classes}
        classesLoading={classesLoading}
        classId={classFilter}
        onClassChange={setClassFilter}
        teachers={teachers}
        teachersLoading={teachersLoading}
        teacherId={teacherFilter}
        onTeacherChange={setTeacherFilter}
        courses={courses}
        coursesLoading={coursesLoading}
        courseId={courseFilter}
        onCourseChange={setCourseFilter}
        dayOfWeek={dayFilter}
        onDayChange={setDayFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
        onAdd={handleAdd}
      />

      <SchedulesViewNav
        mode={mode}
        onModeChange={setMode}
        weekStart={weekStartKey}
        onOffsetChange={handleOffsetChange}
        onJumpToWeek={handleJumpToWeek}
        todayLabel={formatWeekRangeLabel(weekStart)}
      />

      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : null}
      {!isLoading && !error && schedules.length === 0 ? <EmptyState /> : null}

      {!isLoading && !error && schedules.length > 0 && mode === 'week' ? (
        <Card>
          <WeeklyTimetableView
            items={schedules}
            weekStart={weekStart}
            classNamePrefix="schedule-week"
            renderItem={(entry) => <AdminScheduleCard entry={entry} />}
          />
        </Card>
      ) : null}
      {!isLoading && !error && schedules.length > 0 && mode === 'list' ? (
        <SchedulesTable
          schedules={schedules}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete schedule entry"
        message="This action is permanent and cannot be undone. Only this timetable entry is removed."
        confirmLabel="Delete Entry"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget ? (
          <div className="modal__target">
            <p className="modal__target-row">
              Day: <strong>{formatScheduleDayLabel(deleteTarget.dayOfWeek)}</strong>
            </p>
            <p className="modal__target-row">
              Class: <strong>{formatScheduleClassName(deleteTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Course: <strong>{formatScheduleCourseName(deleteTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Room: <strong>{formatScheduleRoom(deleteTarget)}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  )
}

export default SchedulesPage