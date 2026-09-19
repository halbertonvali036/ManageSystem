import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { STUDENT_GENDER } from '@/models/student'
import {
  isFutureDate,
  isValidDate,
  isValidPhone,
} from '@/utils/validation'
import { toDateInputValue } from '@/utils/dateInput'

const GENDER_OPTIONS = [
  { value: '', label: 'Select a gender' },
  { value: STUDENT_GENDER.MALE, label: 'Male' },
  { value: STUDENT_GENDER.FEMALE, label: 'Female' },
  { value: STUDENT_GENDER.OTHER, label: 'Other' },
]

const toDateInputFromValue = (value) => {
  if (!value) {
    return ''
  }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return toDateInputValue(date)
}

const toInitialValues = (profile = {}) => ({
  fullName:
    profile.fullName ||
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
    '',
  dateOfBirth: toDateInputFromValue(profile.dateOfBirth),
  gender: profile.gender || '',
  phone: profile.phone || '',
})

function StudentProfileForm({
  profile,
  email,
  onSubmit,
  submitError,
  isSubmitting,
  onCancel,
}) {
  const [values, setValues] = useState(() => toInitialValues(profile))
  const [errors, setErrors] = useState({})

  const validate = (toValidate = values) => {
    const nextErrors = {}

    if (!toValidate.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.'
    }

    if (toValidate.dateOfBirth) {
      if (!isValidDate(toValidate.dateOfBirth)) {
        nextErrors.dateOfBirth = 'Enter a valid date of birth.'
      } else if (isFutureDate(toValidate.dateOfBirth)) {
        nextErrors.dateOfBirth = 'Date of birth cannot be in the future.'
      }
    }

    if (toValidate.gender) {
      if (!Object.values(STUDENT_GENDER).includes(toValidate.gender)) {
        nextErrors.gender = 'Select a valid gender.'
      }
    }

    if (toValidate.phone && !isValidPhone(toValidate.phone)) {
      nextErrors.phone = 'Enter a valid phone number.'
    }

    return nextErrors
  }

  const handleBlur = (field) => () => {
    setErrors((prev) => ({ ...prev, [field]: validate()[field] }))
  }

  const setField = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    onSubmit({
      fullName: values.fullName.trim(),
      dateOfBirth: values.dateOfBirth || undefined,
      gender: values.gender || undefined,
      phone: values.phone.trim() || undefined,
    })
  }

  const inputClass = (field) =>
    `form__input${errors[field] ? ' form__input--error' : ''}`

  return (
    <form className="student-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="student-form__grid">
        <div className="form__field">
          <label className="form__label" htmlFor="profile-fullName">
            Full Name <span className="form__required">*</span>
          </label>
          <input
            id="profile-fullName"
            className={inputClass('fullName')}
            type="text"
            value={values.fullName}
            onChange={setField('fullName')}
            onBlur={handleBlur('fullName')}
            placeholder="e.g. Jane Cooper"
          />
          {errors.fullName ? (
            <p className="form__error">{errors.fullName}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="profile-dateOfBirth">
            Date of Birth
          </label>
          <input
            id="profile-dateOfBirth"
            className={inputClass('dateOfBirth')}
            type="date"
            value={values.dateOfBirth}
            onChange={setField('dateOfBirth')}
            onBlur={handleBlur('dateOfBirth')}
          />
          {errors.dateOfBirth ? (
            <p className="form__error">{errors.dateOfBirth}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="profile-gender">
            Gender
          </label>
          <select
            id="profile-gender"
            className={`field-select${errors.gender ? ' field-select--error' : ''}`}
            value={values.gender}
            onChange={setField('gender')}
            onBlur={handleBlur('gender')}
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.gender ? <p className="form__error">{errors.gender}</p> : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="profile-phone">
            Phone
          </label>
          <input
            id="profile-phone"
            className={inputClass('phone')}
            type="tel"
            value={values.phone}
            onChange={setField('phone')}
            onBlur={handleBlur('phone')}
            placeholder="e.g. +1 555 010 2030"
          />
          {errors.phone ? <p className="form__error">{errors.phone}</p> : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="profile-email">
            Email
          </label>
          <div className="form__input-wrapper">
            <input
              id="profile-email"
              className="form__input"
              type="email"
              value={email}
              readOnly
            />
          </div>
          <p className="form__hint">
            Email is managed by your institution and cannot be changed here.
          </p>
        </div>
      </div>

      <div className="student-form__actions">
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
            <>
              <ShieldCheck size={16} aria-hidden="true" />
              Save Profile
            </>
          )}
        </button>
        <button
          type="button"
          className="btn btn--outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default StudentProfileForm