import React, { useMemo, useState } from 'react'
import { Task } from '../models'

function makeMonthCells(monthDate: Date) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const startDay = first.getDay()
  const totalDays = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const cells: Array<Date | null> = []

  for (let i = 0; i < startDay; i += 1) cells.push(null)
  for (let day = 1; day <= totalDays; day += 1) cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day))

  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function keyForDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function CalendarPage({ tasks }: { tasks: Task[] }) {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    tasks.forEach((task) => {
      const date = new Date(task.currentDeadline)
      const key = keyForDate(date)
      map.set(key, [...(map.get(key) ?? []), task])
    })
    return map
  }, [tasks])

  const monthCells = useMemo(() => makeMonthCells(viewDate), [viewDate])
  const selectedTasks = selectedDate ? tasksByDate.get(selectedDate) ?? [] : []

  function prevMonth() {
    setViewDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))
  }

  function nextMonth() {
    setViewDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))
  }

  return (
    <section className="page-stack">
      <div className="page-header-v2 panel-v2">
        <h1>Assignment Calendar</h1>
        <p>See each assignment on calendar dates and drill into what is due that day.</p>
      </div>

      <div className="panel-v2 calendar-shell-v2">
        <div className="calendar-topbar-v2">
          <button className="ghost-btn-v2" onClick={prevMonth}>Previous</button>
          <h2>{viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
          <button className="ghost-btn-v2" onClick={nextMonth}>Next</button>
        </div>

        <div className="calendar-legend-v2">
          <span><i className="dot-v2 has" /> Assignment day</span>
          <span><i className="dot-v2 selected" /> Selected day</span>
        </div>

        <div className="calendar-grid-v2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
            <div key={label} className="weekday-v2">{label}</div>
          ))}

          {monthCells.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="date-cell-v2 empty" />

            const key = keyForDate(date)
            const count = tasksByDate.get(key)?.length ?? 0
            const selected = selectedDate === key
            return (
              <button
                key={key}
                className={`date-cell-v2 ${selected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(key)}
              >
                <span>{date.getDate()}</span>
                {count > 0 && <small>{count} task{count > 1 ? 's' : ''}</small>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="panel-v2">
        <div className="section-head-v2">
          <h2>{selectedDate ? `Tasks on ${selectedDate}` : 'Select a date'}</h2>
          <p>{selectedDate ? 'Assignments scheduled for this day.' : 'Click any highlighted day above to view tasks.'}</p>
        </div>

        {selectedDate && selectedTasks.length === 0 && <p className="muted-v2">No assignments on this date.</p>}
        {selectedDate && selectedTasks.length > 0 && (
          <ul className="task-list-v2">
            {selectedTasks.map((task) => (
              <li key={task.id} className="task-row-v2">
                <div>
                  <p className="task-title-v2">{task.title}</p>
                  <p className="task-meta-v2">{task.category ?? 'General'} • {task.completedAt ? 'Completed' : 'Open'}</p>
                </div>
                <span className={`status-tag-v2 ${task.completedAt ? 'completed' : 'ontrack'}`}>
                  {task.completedAt ? 'Done' : 'Planned'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
