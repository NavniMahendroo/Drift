import React, { useState } from 'react'

export interface TaskCreateInput {
  title: string
  deadlineDate: string
  category?: string
}

export default function NewTaskPage({ onCreateTask }: { onCreateTask: (values: TaskCreateInput) => void }) {
  const [title, setTitle] = useState('')
  const [deadlineDate, setDeadlineDate] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || !deadlineDate) {
      setError('Title and deadline date are required.')
      return
    }

    onCreateTask({
      title: title.trim(),
      deadlineDate,
      category: category.trim() || undefined
    })

    setError('')
    setSuccess('Task created successfully.')
    setTitle('')
    setDeadlineDate('')
    setCategory('')
  }

  return (
    <section className="page-stack">
      <div className="page-header-v2 panel-v2">
        <h1>Create New Task</h1>
        <p>Add assignments with due dates and categories in one focused form.</p>
      </div>

      <form className="panel-v2 form-panel-v2" onSubmit={submit}>
        <label className="field-label-v2" htmlFor="taskTitle">Task title</label>
        <input
          id="taskTitle"
          className="field-input-v2"
          placeholder="Finish chemistry lab report"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="field-label-v2" htmlFor="taskDate">Deadline date</label>
        <input
          id="taskDate"
          className="field-input-v2"
          type="date"
          value={deadlineDate}
          onChange={(e) => setDeadlineDate(e.target.value)}
        />

        <label className="field-label-v2" htmlFor="taskCategory">Category (optional)</label>
        <input
          id="taskCategory"
          className="field-input-v2"
          placeholder="Math / Personal / Work"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        {error && <p className="error-text-v2">{error}</p>}
        {success && <p className="success-text-v2">{success}</p>}

        <button className="primary-btn-v2" type="submit">Create Task</button>
      </form>
    </section>
  )
}
