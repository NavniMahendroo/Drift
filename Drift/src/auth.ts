export interface UserProfile {
  name: string
  email: string
  accent: 'coral' | 'teal' | 'blue'
  notifications: boolean
}

interface UserRecord extends UserProfile {
  password: string
  createdAt: string
}

const USERS_KEY = 'drift-users:v1'
const SESSION_KEY = 'drift-session:v1'

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function getUsers(): UserRecord[] {
  return readJSON<UserRecord[]>(USERS_KEY, [])
}

function saveUsers(users: UserRecord[]) {
  writeJSON(USERS_KEY, users)
}

function toProfile(record: UserRecord): UserProfile {
  const { name, email, accent, notifications } = record
  return { name, email, accent, notifications }
}

export function getActiveUser(): UserProfile | null {
  const sessionEmail = readJSON<string | null>(SESSION_KEY, null)
  if (!sessionEmail) return null
  const account = getUsers().find((user) => user.email.toLowerCase() === sessionEmail.toLowerCase())
  return account ? toProfile(account) : null
}

export function signIn(email: string, password: string): { ok: boolean; message?: string } {
  const account = getUsers().find((user) => user.email.toLowerCase() === email.toLowerCase())
  if (!account || account.password !== password) {
    return { ok: false, message: 'Invalid email or password.' }
  }
  writeJSON(SESSION_KEY, account.email)
  return { ok: true }
}

export function signUp(values: {
  name: string
  email: string
  password: string
}): { ok: boolean; message?: string } {
  const cleanEmail = values.email.trim().toLowerCase()
  if (!cleanEmail) return { ok: false, message: 'Email is required.' }

  const users = getUsers()
  if (users.some((user) => user.email.toLowerCase() === cleanEmail)) {
    return { ok: false, message: 'An account with this email already exists.' }
  }

  const next: UserRecord = {
    name: values.name.trim(),
    email: cleanEmail,
    password: values.password,
    accent: 'teal',
    notifications: true,
    createdAt: new Date().toISOString()
  }

  saveUsers([next, ...users])
  writeJSON(SESSION_KEY, next.email)
  return { ok: true }
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY)
}

export function updateActiveUserSettings(updates: Partial<Omit<UserProfile, 'email'>>): UserProfile | null {
  const sessionEmail = readJSON<string | null>(SESSION_KEY, null)
  if (!sessionEmail) return null

  const users = getUsers()
  const index = users.findIndex((user) => user.email.toLowerCase() === sessionEmail.toLowerCase())
  if (index === -1) return null

  const updated: UserRecord = {
    ...users[index],
    ...updates,
    name: updates.name?.trim() ? updates.name.trim() : users[index].name
  }
  users[index] = updated
  saveUsers(users)

  return toProfile(updated)
}
