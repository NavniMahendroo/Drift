import React, { useState } from 'react'
import { Task } from '../models'
import { createTask } from '../utils'
import { loadTasks, saveTasks } from '../storage'

export default function TaskList({
  tasks,
  onOpenTask,
  onChange
}: {
  tasks: Task[]
  onOpenTask: (id: string) => void
  onChange: (tasks: Task[]) => void
}) {
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState('')

  function add() {
    if (!title || !deadline) return
    const t = createTask({ title, originalDeadlineISO: new Date(deadline).toISOString(), category: category || undefined })
    const newTasks = [t, ...tasks]
    saveTasks(newTasks)
    onChange(newTasks)
    setTitle('')
    setDeadline('')
    setCategory('')
  }

  function remove(id: string) {
    const newTasks = tasks.filter((t) => t.id !== id)
    saveTasks(newTasks)
    onChange(newTasks)
  }

  function colorFor(task: Task) {
    if (task.extensionCount === 0) return 'badge badge-green'
    if (task.extensionCount <= 2) return 'badge badge-yellow'
    return 'badge badge-red'
  }

  return (
    <div className="task-list">
      <section className="create">
        <h2>Create task</h2>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <input placeholder="Category (optional)" value={category} onChange={(e) => setCategory(e.target.value)} />
        <div>
          <button onClick={add}>Add</button>
        </div>
      </section>

      <section className="list">
        <h2>Tasks</h2>
        {tasks.length === 0 && <p>No tasks yet.</p>}
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className="task-row">
              <div className="task-main">
                <button className="link" onClick={() => onOpenTask(task.id)}>
                  {task.title}
                </button>
                <div className="meta">
                  <span className={colorFor(task)}>{task.extensionCount}</span>
                  <span className="date">{new Date(task.currentDeadline).toLocaleString()}</span>
                </div>
              </div>
              <div className="task-actions">
                <button onClick={() => remove(task.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
