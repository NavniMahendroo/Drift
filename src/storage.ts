import { Task } from './models'

const LS_KEY = 'soft-deadline-manager:v1'

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return getDemoTasks()
    return JSON.parse(raw) as Task[]
  } catch (e) {
    console.error('Failed to load tasks from localStorage', e)
    return getDemoTasks()
  }
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(tasks))
}

function nowISO() {
  return new Date().toISOString()
}

// Minimal demo data to show features immediately
function getDemoTasks(): Task[] {
  const t1Created = nowISO()
  const orig1 = new Date()
  orig1.setDate(orig1.getDate() + 3)
  const t1: Task = {
    id: 'task-1',
    title: 'Write project spec',
    originalDeadline: orig1.toISOString(),
    currentDeadline: orig1.toISOString(),
    category: 'Work',
    createdAt: t1Created,
    completedAt: null,
    extensionCount: 0,
    deadlineHistory: []
  }

  const t2Created = nowISO()
  const orig2 = new Date()
  orig2.setDate(orig2.getDate() + 1)
  const t2: Task = {
    id: 'task-2',
    title: 'Prepare slides',
    originalDeadline: orig2.toISOString(),
    currentDeadline: orig2.toISOString(),
    category: 'Meetings',
    createdAt: t2Created,
    completedAt: null,
    extensionCount: 1,
    deadlineHistory: [
      {
        previousDeadline: orig2.toISOString(),
        newDeadline: new Date(orig2.getTime() + 2 * 24 * 3600 * 1000).toISOString(),
        reason: 'Underestimated effort',
        changedAt: nowISO()
      }
    ]
  }

  saveTasks([t1, t2])
  return [t1, t2]
}
