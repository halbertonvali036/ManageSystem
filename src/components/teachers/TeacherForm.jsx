import { useState } from 'react'
import useDepartments from '@/hooks/useDepartments'
import useSubjects from '@/hooks/useSubjects'
import { GENDER } from '@/models/gender'
import { formatDepartmentName } from '@/models/department'
import { formatSubjectName } from '@/models/subject'
import { TEACHER_STATUS_LABELS } from '@/models/teacher'
import { toTeacherFormValues } from '@/utils/teacherForm'
import {
  isFutureDate,
  isValidDate,
  isValidEmail,
  isValidPhone,
} from '@/utils/validation'

const GENDER_OPTIONS = [
  { value: GENDER.MALE, label: 'Male' },
  { value: GENDER.FEMALE, label: 'Female' },
  { value: GENDER.OTHER, label: 'Other' },
]

const EMPTY_VALUES = toTeacherFormValues()

function TeacherForm({
  initialValues = EMPTY_VALUES,
  submitLabel = 'Save Teacher',
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  serverFieldErrors,
}) {
  const [values, setValues] = useState(() => toTeacherFormValues(initialValues))
  const [clientErrors, setClientErrors] = useState({})

  const { departments, isLoading: departmentsLoading } = useDepartments()
  const { subjects, isLoading: subjectsLoading } = useSubjects()

  const departmentOptions = departments.map((department) =>
    formatDepartmentName(department),
  )
  const departmentsAvailable = departmentOptions.length > 0
  const subjectOptions = subjects.map((subject) => formatSubjectName(subject))
  const subjectsAvailable = subjectOptions.length > 0

  const validate = (toValidate = values) => {
    const errors = {}

    if (!toValidate.teacherId.trim()) {
      errors.teacherId = 'Teacher ID is required.'
    }

    if (!toValidate.firstName.trim()) {
      errors.firstName = 'First name is required.'
    }

    if (!toValidate.lastName.trim()) {
      errors.lastName = 'Last name is required.'
    }

    const email = toValidate.email.trim()
    if (!email) {
      errors.email = 'Email is required.'
    } else if (!isValidEmail(email)) {
      errors.email = 'Enter a valid email address.'
    }

    const phone = toValidate.phone.trim()
    if (phone && !isValidPhone(phone)) {
      errors.phone = 'Enter a valid phone number.'
    }

    if (toValidate.dateOfBirth) {
      if (!isValidDate(toValidate.dateOfBirth)) {
        errors.dateOfBirth = 'Enter a valid date of birth.'
      } else if (isFutureDate(toValidate.dateOfBirth)) {
        errors.dateOfBirth = 'Date of birth cannot be in the future.'
      }
    }

    if (toValidate.gender && !Object.values(GENDER).includes(toValidate.gender)) {
      errors.gender = 'Select a valid gender.'
    }

    if (toValidate.hireDate) {
      if (!isValidDate(toValidate.hireDate)) {
        errors.hireDate = 'Enter a valid hire date.'
      } else if (isFutureDate(toValidate.hireDate)) {
        errors.hireDate = 'Hire date cannot be in the future.'
      }
    }

    if (toValidate.department && departmentsAvailable && !departmentOptions.includes(toValidate.department)) {
      errors.department = 'Select a valid department.'
    }

    if (toValidate.subject && subjectsAvailable && !subjectOptions.includes(toValidate.subject)) {
      errors.subject = 'Select a valid subject.'
    }

    if (!toValidate.status) {
      errors.status = 'Status is required.'
    }

    return errors
  }

  const setField = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
    setClientErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleBlur = (field) => () => {
    setClientErrors((prev) => ({ ...prev, [field]: validate()[field] }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }
    const nextErrors = validate()
    setClientErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    onSubmit(values)
  }

  const fieldError = (field) => clientErrors[field] ?? serverFieldErrors[field]

  const inputClass = (field) =>
    `form__input${fieldError(field) ? ' form__input--error' : ''}`

  const renderedError = (field) =>
    fieldError(field) ? <p className="form__error">{fieldError(field)}</p> : null

  return (
    <form className="teacher-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="teacher-form__grid">
        <div className="form__field">
          <label className="form__label" htmlFor="teacher-teacherId">
            Teacher ID <span className="form__required">*</span>
          </label>
          <input
            id="teacher-teacherId"
            className={inputClass('teacherId')}
            type="text"
            value={values.teacherId}
            onChange={setField('teacherId')}
            onBlur={handleBlur('teacherId')}
            placeholder="e.g. TCH-0001"
            disabled={isSubmitting}
          />
          {renderedError('teacherId')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="teacher-status">
            Status <span className="form__required">*</span>
          </label>
          <select
            id="teacher-status"
            className="form__input form__select"
            value={values.status}
            onChange={setField('status')}
            disabled={isSubmitting}
          >
            <option value="">Select status</option>
            {Object.entries(TEACHER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {renderedError('status')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="teacher-firstName">
            First Name <span className="form__required">*</span>
          </label>
          <input
            id="teacher-firstName"
            className={inputClass('firstName')}
            type="text"
            value={values.firstName}
            onChange={setField('firstName')}
            onBlur={handleBlur('firstName')}
            placeholder="e.g. Alice"
            disabled={isSubmitting}
          />
          {renderedError('firstName')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="teacher-lastName">
            Last Name <span className="form__required">*</span>
          </label>
          <input
            id="teacher-lastName"
            className={inputClass('lastName')}
            type="text"
            value={values.lastName}
            onChange={setField('lastName')}
            onBlur={handleBlur('lastName')}
            placeholder="e.g. Johnson"
            disabled={isSubmitting}
          />
          {renderedError('lastName')}
        </div>

        <div className="form__field teacher-form__field--full">
          <label className="form__label" htmlFor="teacher-email">
            Email <span className="form__required">*</span>
          </label>
          <input
            id="teacher-email"
            className={inputClass('email')}
            type="email"
            autoComplete="off"
            value={values.email}
            onChange={setField('email')}
            onBlur={handleBlur('email')}
            placeholder="e.g. alice@example.com"
            disabled={isSubmitting}
          />
          {renderedError('email')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="teacher-phone">
            Phone
          </label>
          <input
            id="teacher-phone"
            className={inputClass('phone')}
            type="tel"
            autoComplete="off"
            value={values.phone}
            onChange={setField('phone')}
            onBlur={handleBlur('phone')}
            placeholder="e.g. +1 555 010 1234"
            disabled={isSubmitting}
          />
          {renderedError('phone')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="teacher-dob">
            Date of Birth
          </label>
          <input
            id="teacher-dob"
            className={inputClass('dateOfBirth')}
            type="date"
            value={values.dateOfBirth}
            onChange={setField('dateOfBirth')}
            onBlur={handleBlur('dateOfBirth')}
            disabled={isSubmitting}
          />
          {renderedError('dateOfBirth')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="teacher-gender">
            Gender
          </label>
          <select
            id="teacher-gender"
            className="form__input form__select"
            value={values.gender}
            onChange={setField('gender')}
            disabled={isSubmitting}
          >
            <option value="">Select gender</option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {renderedError('gender')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="teacher-department">
            Department
          </label>
          <select
            id="teacher-department"
            className="form__input form__select"
            value={values.department}
            onChange={setField('department')}
            onBlur={handleBlur('department')}
            disabled={isSubmitting || departmentsLoading || !departmentsAvailable}
          >
            <option value="">
              {departmentsLoading
                ? 'Loading departments\u2026'
                : departmentsAvailable
                  ? 'Select department'
                  : 'No departments available yet'}
            </option>
            {departmentsAvailable
              ? departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))
              : null}
          </select>
          {departmentsLoading || departmentsAvailable ? (
            renderedError('department')
          ) : (
            <p className="form__hint">
              Department options will appear here once department data is
              available.
            </p>
          )}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="teacher-subject">
            Subject / Specialization
          </label>
          <select
            id="teacher-subject"
            className="form__input form__select"
            value={values.subject}
            onChange={setField('subject')}
            onBlur={handleBlur('subject')}
            disabled={isSubmitting || subjectsLoading || !subjectsAvailable}
          >
            <option value="">
              {subjectsLoading
                ? 'Loading subjects\u2026'
                : subjectsAvailable
                  ? 'Select subject'
                  : 'No subjects available yet'}
            </option>
            {subjectsAvailable
              ? subjectOptions.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))
              : null}
          </select>
          {subjectsLoading || subjectsAvailable ? (
            renderedError('subject')
          ) : (
            <p className="form__hint">
              Subject options will appear here once subject data is available.
            </p>
          )}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="teacher-hireDate">
            Hire Date
          </label>
          <input
            id="teacher-hireDate"
            className={inputClass('hireDate')}
            type="date"
            value={values.hireDate}
            onChange={setField('hireDate')}
            onBlur={handleBlur('hireDate')}
            disabled={isSubmitting}
          />
          {renderedError('hireDate')}
        </div>
      </div>

      <div className="teacher-form__actions">
        <button
          type="button"
          className="btn"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Saving&hellip;
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  )
}

export default TeacherForm