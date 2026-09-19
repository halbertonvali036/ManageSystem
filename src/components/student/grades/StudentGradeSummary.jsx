import { BookOpenCheck, ClipboardList, Percent } from 'lucide-react'
import StatCard from '@/components/common/StatCard'
import {
  computeGradePercentage,
  formatGradeCourseName,
} from '@/models/grade'

const computeGradeSummary = (grades) => {
  const courseKeys = new Set()
  let completed = 0
  let percentageSum = 0
  let percentageCount = 0

  for (const grade of grades) {
    const course = formatGradeCourseName(grade)
    if (course && course !== '—') {
      courseKeys.add(course)
    }
    completed += 1
    const percentage = computeGradePercentage(grade)
    if (percentage !== null) {
      percentageSum += percentage
      percentageCount += 1
    }
  }

  const averagePercentage =
    percentageCount > 0
      ? Math.round(percentageSum / percentageCount)
      : null

  return {
    courses: courseKeys.size,
    completed,
    averagePercentage,
  }
}

function StudentGradeSummary({ grades }) {
  const summary = computeGradeSummary(grades)

  return (
    <div className="stats-grid student-grade-stats" aria-label="Grade summary">
      <StatCard
        icon={BookOpenCheck}
        label="Courses with Grades"
        value={summary.courses}
      />
      <StatCard
        icon={ClipboardList}
        label="Assessments Completed"
        value={summary.completed}
      />
      <StatCard
        icon={Percent}
        label="Average Percentage"
        value={
          summary.averagePercentage === null
            ? '—'
            : `${summary.averagePercentage}%`
        }
      />
    </div>
  )
}

export default StudentGradeSummary