// Data models and schema for Soft Deadline Manager
// Keep models minimal and explicit to ensure determinism.

export type ID = string

export interface DeadlineChange {
  previousDeadline: string // ISO date
  newDeadline: string // ISO date
  reason?: string
  changedAt: string // ISO date
}

export interface Task {
  id: ID
  title: string
  // originalDeadline is immutable: never overwritten by app logic
  originalDeadline: string // ISO date
  currentDeadline: string // ISO date (reflects latest deadline)
  category?: string
  createdAt: string // ISO date
  completedAt?: string | null // ISO date or null
  extensionCount: number
  deadlineHistory: DeadlineChange[]
}

// Design decision: store ISO strings to keep storage and serialization deterministic
