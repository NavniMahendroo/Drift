import React, { useMemo, useState } from 'react'
import { Task } from '../models'
import { extendDeadline, completeTask } from '../utils'
import { loadTasks, saveTasks } from '../storage'

const PRESET_REASONS = ['Underestimated effort', 'Low energy', 'Waiting on someone']

export default function TaskDetail({
  taskId,
  tasks,
  onBack,
  onChange
}: {
  taskId: string
  tasks: Task[]
  onBack: () => void
  onChange: (tasks: Task[]) => void
}) {
  const task = tasks.find((t) => t.id === taskId)
  const [newDate, setNewDate] = useState('')
  const [reason, setReason] = useState('')

  if (!task) return (
    <div>
      <p>Task not found</p>
      <button onClick={onBack}>Back</button>
    </div>
  )

  const timeline = useMemo(() => {
    // Original first, then history entries in order, then completion if any
    const list = [{ label: 'Original deadline', date: task.originalDeadline, reason: undefined } as any]
    task.deadlineHistory.forEach((h, i) => list.push({ label: `Extension ${i + 1}`, date: h.newDeadline, reason: h.reason, changedAt: h.changedAt }))
    if (task.completedAt) list.push({ label: 'Completed', date: task.completedAt })
    return list
  }, [task])

  function applyExtension() {
    if (!newDate) return
    const newISO = new Date(newDate).toISOString()
    const updated = extendDeadline(task, newISO, reason || undefined)
    const updatedTasks = tasks.map((t) => (t.id === task.id ? updated : t))
    saveTasks(updatedTasks)
    onChange(updatedTasks)
    setNewDate('')
    setReason('')
  }

  function markComplete() {
    const updated = completeTask(task)
    const updatedTasks = tasks.map((t) => (t.id === task.id ? updated : t))
    saveTasks(updatedTasks)
    onChange(updatedTasks)
  }

  return (
    <div className="task-detail">
      <button onClick={onBack}>Back</button>
      <h2>{task.title}</h2>
      <div className="task-info">
        <div><strong>Original:</strong> {new Date(task.originalDeadline).toLocaleString()}</div>
        <div><strong>Current:</strong> {new Date(task.currentDeadline).toLocaleString()}</div>
        <div><strong>Extensions:</strong> {task.extensionCount}</div>
        <div><strong>Category:</strong> {task.category ?? '—'}</div>
        <div><strong>Created:</strong> {new Date(task.createdAt).toLocaleString()}</div>
        <div><strong>Completed:</strong> {task.completedAt ? new Date(task.completedAt).toLocaleString() : 'No'}</div>
      </div>

      <section className="extend">
        <h3>Extend / Move deadline</h3>
        <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">(no reason)</option>
          {PRESET_REASONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
          <option value="__custom__">-- Custom --</option>
        </select>
        {reason === '__custom__' && (
          <input placeholder="Custom reason" onChange={(e) => setReason(e.target.value)} />
        )}
        <div>
          <button onClick={applyExtension}>Apply</button>
          <button onClick={markComplete}>Mark completed</button>
        </div>
      </section>

      <section className="timeline">
        <h3>Timeline (read-only)</h3>
        <ol>
          <li>
            <strong>Original:</strong> {new Date(task.originalDeadline).toLocaleString()}
          </li>
          {task.deadlineHistory.map((h, i) => (
            <li key={i}>
              <div><strong>Changed:</strong> {new Date(h.changedAt).toLocaleString()}</div>
              <div><strong>From:</strong> {new Date(h.previousDeadline).toLocaleString()}</div>
              <div><strong>To:</strong> {new Date(h.newDeadline).toLocaleString()}</div>
              <div><strong>Reason:</strong> {h.reason ?? '—'}</div>
            </li>
          ))}
          {task.completedAt && (
            <li>
              <div><strong>Completed:</strong> {new Date(task.completedAt).toLocaleString()}</div>
            </li>
          )}
        </ol>
      </section>
    </div>
  )
}
