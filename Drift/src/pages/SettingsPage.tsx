import React, { useState } from 'react'
import { UserProfile } from '../auth'

export default function SettingsPage({
  user,
  onSave
}: {
  user: UserProfile
  onSave: (updates: Partial<Omit<UserProfile, 'email'>>) => void
}) {
  const [name, setName] = useState(user.name)
  const [accent, setAccent] = useState<UserProfile['accent']>(user.accent)
  const [notifications, setNotifications] = useState(user.notifications)
  const [saved, setSaved] = useState(false)

  function submit(event: React.FormEvent) {
    event.preventDefault()
    onSave({ name, accent, notifications })
    setSaved(true)
    setTimeout(() => setSaved(false), 1400)
  }

  return (
    <section className="page-stack">
      <div className="page-header-v2 panel-v2">
        <h1>User Settings</h1>
        <p>Manage your profile and preferences for how Drift feels and alerts you.</p>
      </div>

      <form className="panel-v2 form-panel-v2" onSubmit={submit}>
        <label className="field-label-v2" htmlFor="settingsName">Display name</label>
        <input
          id="settingsName"
          className="field-input-v2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="field-label-v2" htmlFor="settingsEmail">Email</label>
        <input id="settingsEmail" className="field-input-v2" value={user.email} disabled />

        <label className="field-label-v2" htmlFor="settingsAccent">Theme accent</label>
        <select
          id="settingsAccent"
          className="field-input-v2"
          value={accent}
          onChange={(e) => setAccent(e.target.value as UserProfile['accent'])}
        >
          <option value="teal">Teal Ocean</option>
          <option value="coral">Coral Sunset</option>
          <option value="blue">Blue Nightfall</option>
        </select>

        <label className="toggle-row-v2">
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
          Enable deadline reminders
        </label>

        {saved && <p className="success-text-v2">Settings saved.</p>}
        <button className="primary-btn-v2" type="submit">Save Settings</button>
      </form>
    </section>
  )
}
