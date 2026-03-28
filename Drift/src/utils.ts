import { Task, DeadlineChange } from './models'

// Core domain logic separated from UI.

export function extendDeadline(task: Task, newDeadlineISO: string, reason?: string): Task {
  // Save previous deadline, increment extension count, append history entry.
  const previous = task.currentDeadline
  const changedAt = new Date().toISOString()

  const change: DeadlineChange = {
    previousDeadline: previous,
    newDeadline: newDeadlineISO,
    reason: reason?.trim() ? reason : undefined,
    changedAt
  }

  // Do not modify originalDeadline: leave as-is
  const updated: Task = {
    ...task,
    currentDeadline: newDeadlineISO,
    extensionCount: task.extensionCount + 1,
    deadlineHistory: [...task.deadlineHistory, change]
  }
  return updated
}

export function createTask(fields: {
  title: string
  originalDeadlineISO: string
  category?: string
}): Task {
  const now = new Date().toISOString()
  return {
    id: `task-${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: fields.title,
    originalDeadline: fields.originalDeadlineISO,
    currentDeadline: fields.originalDeadlineISO,
    category: fields.category,
    createdAt: now,
    completedAt: null,
    extensionCount: 0,
    deadlineHistory: []
  }
}

export function completeTask(task: Task, atISO?: string): Task {
  return { ...task, completedAt: atISO ?? new Date().toISOString() }
}

export function isCompletedEarly(task: Task): boolean {
  if (!task.completedAt) return false
  return new Date(task.completedAt) < new Date(task.originalDeadline)
}

export function isCompletedOnTime(task: Task): boolean {
  if (!task.completedAt) return false
  const completed = new Date(task.completedAt)
  const orig = new Date(task.originalDeadline)
  return completed >= orig && completed <= new Date(task.currentDeadline)
}

export function isCompletedLate(task: Task): boolean {
  if (!task.completedAt) return false
  return new Date(task.completedAt) > new Date(task.originalDeadline)
}
