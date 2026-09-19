export const SETTINGS_LANGUAGES = Object.freeze([
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Fran\u00e7ais' },
  { value: 'es', label: 'Espa\u00f1ol' },
  { value: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' },
  { value: 'de', label: 'Deutsch' },
  { value: 'tr', label: 'T\u00fcrk\u00e7e' },
])

export const SETTINGS_TIMEZONES = Object.freeze([
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (New York)' },
  { value: 'America/Chicago', label: 'Central Time (Chicago)' },
  { value: 'America/Denver', label: 'Mountain Time (Denver)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Kolkata', label: 'India (Kolkata)' },
  { value: 'Asia/Shanghai', label: 'China (Shanghai)' },
  { value: 'Asia/Tokyo', label: 'Japan (Tokyo)' },
  { value: 'Australia/Sydney', label: 'Sydney' },
])

export const SETTINGS_DATE_FORMATS = Object.freeze([
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY' },
])

export const SETTINGS_TIME_FORMATS = Object.freeze([
  { value: '12h', label: '12-hour (e.g. 2:30 PM)' },
  { value: '24h', label: '24-hour (e.g. 14:30)' },
])

export const SETTINGS_PAGE_SIZES = Object.freeze([
  { value: '10', label: '10 rows' },
  { value: '25', label: '25 rows' },
  { value: '50', label: '50 rows' },
  { value: '100', label: '100 rows' },
])

export const SETTINGS_THEMES = Object.freeze([
  { value: 'system', label: 'Match system' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
])

const currentYear = new Date().getFullYear()

export const ACADEMIC_YEAR_OPTIONS = Object.freeze([
  { value: `${currentYear - 1}-${currentYear}`, label: `${currentYear - 1} / ${currentYear}` },
  { value: `${currentYear}-${currentYear + 1}`, label: `${currentYear} / ${currentYear + 1}` },
  { value: `${currentYear + 1}-${currentYear + 2}`, label: `${currentYear + 1} / ${currentYear + 2}` },
])

export const SETTINGS_SEMESTERS = Object.freeze([
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
])

export const createDefaultSettings = () => ({
  schoolName: '',
  institutionEmail: '',
  phone: '',
  address: '',
  academicYear: '',
  semester: '',
  timezone: '',
  defaultLanguage: '',
  adminName: '',
  adminEmail: '',
  theme: '',
  dateFormat: '',
  timeFormat: '',
  pageSize: '',
})

export const toSettingsValues = (payload) => {
  const defaults = createDefaultSettings()
  if (!payload || typeof payload !== 'object') {
    return defaults
  }
  return Object.keys(defaults).reduce((result, key) => {
    const value = payload[key]
    result[key] = value === undefined || value === null ? defaults[key] : value
    return result
  }, {})
}

/**
 * @typedef {Object} SettingsValues
 * @property {string} schoolName
 * @property {string} institutionEmail
 * @property {string} phone
 * @property {string} address
 * @property {string} academicYear
 * @property {string} semester
 * @property {string} timezone
 * @property {string} defaultLanguage
 * @property {string} adminName
 * @property {string} adminEmail
 * @property {string} theme
 * @property {string} dateFormat
 * @property {string} timeFormat
 * @property {string} pageSize
 */