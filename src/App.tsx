import React, { useEffect, useState } from 'react'
import { Task } from './models'
import { loadTasks, saveTasks } from './storage'
import TaskList from './components/TaskList'
import TaskDetail from './components/TaskDetail'
import Insights from './components/Insights'

// Simple page navigation to keep this MVP focused and small.
type Page = { name: 'list' } | { name: 'detail'; taskId: string } | { name: 'insights' }

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [page, setPage] = useState<Page>({ name: 'list' })

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  useEffect(() => {
    // ensure tasks loaded from storage initially
    setTasks(loadTasks())
  }, [])

  const refresh = () => setTasks(loadTasks())

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Soft Deadline Manager</h1>
        <nav>
          <button onClick={() => setPage({ name: 'list' })}>Tasks</button>
          <button onClick={() => setPage({ name: 'insights' })}>Insights</button>
        </nav>
      </header>
      <main>
        {page.name === 'list' && (
          <TaskList
            tasks={tasks}
            onOpenTask={(id) => setPage({ name: 'detail', taskId: id })}
            onChange={(newTasks) => setTasks(newTasks)}
          />
        )}
        {page.name === 'detail' && (
          <TaskDetail
            taskId={page.taskId}
            tasks={tasks}
            onBack={() => setPage({ name: 'list' })}
            onChange={(newTasks) => setTasks(newTasks)}
          />
        )}
        {page.name === 'insights' && <Insights tasks={tasks} onBack={() => setPage({ name: 'list' })} />}
      </main>
      <footer className="app-footer">Calm, neutral UI showing deadline drift.</footer>
    </div>
  )
}
