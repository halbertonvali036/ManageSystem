const MOCK_LOGIN_DELAY_MS = 600
const SESSION_STORAGE_KEY = 'managesystem-auth-session'

export const DEMO_ACCOUNTS = Object.freeze([
  {
    id: 'admin-1',
    name: 'System Admin',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 'teacher-1',
    name: 'Demo Teacher',
    email: 'teacher@demo.com',
    password: 'teacher123',
    role: 'teacher',
  },
  {
    id: 'student-1',
    name: 'Demo Student',
    email: 'student@demo.com',
    password: 'student123',
    role: 'student',
  },
])

const MOCK_TOKEN = 'mock-jwt-token'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const normalizeEmail = (email) => email.trim().toLowerCase()

const readStoredSession = () => {
  const raw =
    sessionStorage.getItem(SESSION_STORAGE_KEY) ??
    localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const clearStoredSession = () => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

const login = async (credentials, { remember = false } = {}) => {
  await delay(MOCK_LOGIN_DELAY_MS)

  const inputEmail = normalizeEmail(credentials.email)
  const account = DEMO_ACCOUNTS.find(
    (item) => normalizeEmail(item.email) === inputEmail,
  )

  if (!account || credentials.password !== account.password) {
    throw new Error('Invalid email or password.')
  }

  const session = {
    token: MOCK_TOKEN,
    user: {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
    },
  }

  const storage = remember ? localStorage : sessionStorage
  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  return session
}

const logout = () => {
  clearStoredSession()
}

const authService = {
  login,
  logout,
  getStoredSession: readStoredSession,
  clearStoredSession,
}

export default authService