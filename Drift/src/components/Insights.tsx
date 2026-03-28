import React, { useMemo } from 'react'
import { Task } from '../models'

export default function Insights({ tasks, onBack }: { tasks: Task[]; onBack: () => void }) {
  const tasksWithMostExtensions = useMemo(() => [...tasks].sort((a, b) => b.extensionCount - a.extensionCount).slice(0, 5), [tasks])

  const avgExtensions = useMemo(() => {
    if (tasks.length === 0) return 0
    return tasks.reduce((s, t) => s + t.extensionCount, 0) / tasks.length
  }, [tasks])

  const reasonCounts = useMemo(() => {
    const map = new Map<string, number>()
    tasks.forEach((t) => t.deadlineHistory.forEach((h) => {
      const r = h.reason ?? 'Unspecified'
      map.set(r, (map.get(r) ?? 0) + 1)
    }))
    const arr = Array.from(map.entries()).sort((a, b) => b[1] - a[1])
    return arr
  }, [tasks])

  return (
    <div className="insights">
      <button onClick={onBack}>Back</button>
      <h2>Insights</h2>

      <section>
        <h3>Tasks with most extensions</h3>
        <ol>
          {tasksWithMostExtensions.map((t) => (
            <li key={t.id}>{t.title} — {t.extensionCount} extensions</li>
          ))}
        </ol>
      </section>

      <section>
        <h3>Average extensions per task</h3>
        <p>{avgExtensions.toFixed(2)}</p>
      </section>

      <section>
        <h3>Most common delay reasons</h3>
        <ul>
          {reasonCounts.map(([r, c]) => (
            <li key={r}>{r} — {c}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
