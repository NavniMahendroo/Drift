import React, { useMemo } from 'react'
import { Task } from '../models'

function taskStatus(task: Task): 'completed' | 'missed' | 'soon' | 'ontrack' {
  if (task.completedAt) return 'completed'
  const now = Date.now()
  const due = new Date(task.currentDeadline).getTime()
  if (due < now) return 'missed'
  if (due - now <= 48 * 60 * 60 * 1000) return 'soon'
  return 'ontrack'
}

export default function DashboardPage({ tasks, onToggleCompletion }: { tasks: Task[]; onToggleCompletion: (taskId: string) => void }) {
  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completedAt).length
    const dueSoon = tasks.filter((task) => taskStatus(task) === 'soon').length
    const missed = tasks.filter((task) => taskStatus(task) === 'missed').length
    const open = tasks.length - completed
    return { completed, dueSoon, missed, open }
  }, [tasks])

  const completionRate = useMemo(() => {
    if (tasks.length === 0) return 0
    return Math.round((stats.completed / tasks.length) * 100)
  }, [stats.completed, tasks.length])

  const topItems = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(a.currentDeadline).getTime() - new Date(b.currentDeadline).getTime())
      .slice(0, 8)
  }, [tasks])

  return (
    <section className="page-stack">
      <div className="page-header-v2 panel-v2">
        <h1>Project Overview</h1>
        <p>One clear place to track due, done, overdue, and total task health.</p>
        <div className="hero-strip-v2">
          <div>
            <p className="metric-label">Completion</p>
            <p className="metric-value">{completionRate}%</p>
          </div>
          <div className="progress-track-v2" aria-label="Completion progress">
            <div className="progress-fill-v2" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      </div>

      <div className="stats-grid-v2">
        <article className="metric-card panel-v2">
          <p className="metric-label">Total Tasks</p>
          <p className="metric-value">{tasks.length}</p>
        </article>
        <article className="metric-card panel-v2">
          <p className="metric-label">Done</p>
          <p className="metric-value">{stats.completed}</p>
        </article>
        <article className="metric-card panel-v2">
          <p className="metric-label">Open</p>
          <p className="metric-value">{stats.open}</p>
        </article>
        <article className="metric-card panel-v2">
          <p className="metric-label">Due Soon</p>
          <p className="metric-value">{stats.dueSoon}</p>
        </article>
        <article className="metric-card panel-v2 warning">
          <p className="metric-label">Overdue / Missed</p>
          <p className="metric-value">{stats.missed}</p>
        </article>
      </div>

      <div className="panel-v2 task-board">
        <div className="section-head-v2">
          <h2>Assignments</h2>
          <p>Quickly mark work done or reopen completed tasks.</p>
        </div>

        {topItems.length === 0 && <p className="muted-v2">No tasks yet. Use New Task to create your first assignment.</p>}

        <ul className="task-list-v2">
          {topItems.map((task) => {
            const status = taskStatus(task)
            const statusText = status === 'completed' ? 'Done' : status === 'missed' ? 'Missed' : status === 'soon' ? 'Due soon' : 'On track'
            return (
              <li key={task.id} className="task-row-v2">
                <div>
                  <p className="task-title-v2">{task.title}</p>
                  <p className="task-meta-v2">Due {new Date(task.currentDeadline).toLocaleDateString()} • {task.category ?? 'General'}</p>
                </div>
                <div className="task-row-actions-v2">
                  <span className={`status-tag-v2 ${status}`}>{statusText}</span>
                  <button className="ghost-btn-v2" onClick={() => onToggleCompletion(task.id)}>
                    {task.completedAt ? 'Reopen' : 'Mark done'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
