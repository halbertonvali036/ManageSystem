import { useState } from 'react'
import useClasses from '@/hooks/useClasses'
import {
  STUDENT_GENDER,
  STUDENT_STATUS_LABELS,
} from '@/models/student'
import {
  isFutureDate,
  isValidDate,
  isValidEmail,
  isValidPhone,
} from '@/utils/validation'
import { toStudentFormValues } from '@/utils/studentForm'

const GENDER_OPTIONS = [
  { value: STUDENT_GENDER.MALE, label: 'Male' },
  { value: STUDENT_GENDER.FEMALE, label: 'Female' },
  { value: STUDENT_GENDER.OTHER, label: 'Other' },
]

const EMPTY_VALUES = toStudentFormValues()

function StudentForm({
  initialValues = EMPTY_VALUES,
  submitLabel = 'Save Student',
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  serverFieldErrors,
}) {
  const { classes, isLoading: classesLoading } = useClasses()
  const [values, setValues] = useState(() => toStudentFormValues(initialValues))
  const [clientErrors, setClientErrors] = useState({})

  const validate = (toValidate = values) => {
    const errors = {}

    if (!toValidate.studentId.trim()) {
      errors.studentId = 'Student ID is required.'
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

    if (
      toValidate.gender &&
      !Object.values(STUDENT_GENDER).includes(toValidate.gender)
    ) {
      errors.gender = 'Select a valid gender.'
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

  return (
    <form className="student-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="student-form__grid">
        <div className="form__field">
          <label className="form__label" htmlFor="student-studentId">
            Student ID <span className="form__required">*</span>
          </label>
          <input
            id="student-studentId"
            className={inputClass('studentId')}
            type="text"
            value={values.studentId}
            onChange={setField('studentId')}
            onBlur={handleBlur('studentId')}
            placeholder="e.g. STU-0001"
            disabled={isSubmitting}
            aria-invalid={fieldError('studentId') ? 'true' : 'false'}
          />
          {fieldError('studentId') ? (
            <p className="form__error">{fieldError('studentId')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="student-class">
            Class <span className="form__optional">Optional</span>
          </label>
          <select
            id="student-class"
            className="form__input form__select"
            value={values.className}
            onChange={setField('className')}
            disabled={isSubmitting || classesLoading || classes.length === 0}
          >
            <option value="">
              {classesLoading
                ? 'Loading classes\u2026'
                : classes.length === 0
                  ? 'No classes available'
                  : 'Select a class'}
            </option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {!classesLoading && classes.length === 0 ? (
            <p className="form__hint">No classes available yet.</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="student-firstName">
            First Name <span className="form__required">*</span>
          </label>
          <input
            id="student-firstName"
            className={inputClass('firstName')}
            type="text"
            value={values.firstName}
            onChange={setField('firstName')}
            onBlur={handleBlur('firstName')}
            placeholder="e.g. Alice"
            disabled={isSubmitting}
            aria-invalid={fieldError('firstName') ? 'true' : 'false'}
          />
          {fieldError('firstName') ? (
            <p className="form__error">{fieldError('firstName')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="student-lastName">
            Last Name <span className="form__required">*</span>
          </label>
          <input
            id="student-lastName"
            className={inputClass('lastName')}
            type="text"
            value={values.lastName}
            onChange={setField('lastName')}
            onBlur={handleBlur('lastName')}
            placeholder="e.g. Johnson"
            disabled={isSubmitting}
            aria-invalid={fieldError('lastName') ? 'true' : 'false'}
          />
          {fieldError('lastName') ? (
            <p className="form__error">{fieldError('lastName')}</p>
          ) : null}
        </div>

        <div className="form__field student-form__field--full">
          <label className="form__label" htmlFor="student-email">
            Email <span className="form__required">*</span>
          </label>
          <input
            id="student-email"
            className={inputClass('email')}
            type="email"
            autoComplete="off"
            value={values.email}
            onChange={setField('email')}
            onBlur={handleBlur('email')}
            placeholder="e.g. alice@example.com"
            disabled={isSubmitting}
            aria-invalid={fieldError('email') ? 'true' : 'false'}
          />
          {fieldError('email') ? (
            <p className="form__error">{fieldError('email')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="student-phone">
            Phone
          </label>
          <input
            id="student-phone"
            className={inputClass('phone')}
            type="tel"
            autoComplete="off"
            value={values.phone}
            onChange={setField('phone')}
            onBlur={handleBlur('phone')}
            placeholder="e.g. +1 555 010 1234"
            disabled={isSubmitting}
            aria-invalid={fieldError('phone') ? 'true' : 'false'}
          />
          {fieldError('phone') ? (
            <p className="form__error">{fieldError('phone')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="student-dob">
            Date of Birth
          </label>
          <input
            id="student-dob"
            className={inputClass('dateOfBirth')}
            type="date"
            value={values.dateOfBirth}
            onChange={setField('dateOfBirth')}
            onBlur={handleBlur('dateOfBirth')}
            disabled={isSubmitting}
            aria-invalid={fieldError('dateOfBirth') ? 'true' : 'false'}
          />
          {fieldError('dateOfBirth') ? (
            <p className="form__error">{fieldError('dateOfBirth')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="student-gender">
            Gender
          </label>
          <select
            id="student-gender"
            className="form__input form__select"
            value={values.gender}
            onChange={setField('gender')}
            disabled={isSubmitting}
            aria-invalid={fieldError('gender') ? 'true' : 'false'}
          >
            <option value="">Select gender</option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldError('gender') ? (
            <p className="form__error">{fieldError('gender')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="student-status">
            Status <span className="form__required">*</span>
          </label>
          <select
            id="student-status"
            className="form__input form__select"
            value={values.status}
            onChange={setField('status')}
            disabled={isSubmitting}
            aria-invalid={fieldError('status') ? 'true' : 'false'}
          >
            <option value="">Select status</option>
            {Object.entries(STUDENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {fieldError('status') ? (
            <p className="form__error">{fieldError('status')}</p>
          ) : null}
        </div>
      </div>

      <div className="student-form__actions">
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

export default StudentForm