import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../auth'

export default function SignInPage({ onSignedIn }: { onSignedIn: () => void }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const result = signIn(email, password)
    if (!result.ok) {
      setError(result.message ?? 'Sign in failed.')
      return
    }
    onSignedIn()
    navigate('/app/dashboard')
  }

  return (
    <div className="auth-screen">
      <div className="auth-layout panel-v2">
        <aside className="auth-art">
          <p className="auth-kicker">Deadline clarity</p>
          <h2 className="auth-art-title">Work calmer. Submit earlier.</h2>
          <p className="auth-art-text">Drift keeps every assignment visible with one dashboard, one calendar, and one clean workflow.</p>
          <div className="auth-pill-row">
            <span>Projects</span>
            <span>Calendar</span>
            <span>Focus</span>
          </div>
        </aside>

        <div className="auth-panel">
          <p className="auth-kicker">Welcome back</p>
          <h1 className="auth-title">Sign in to Drift</h1>
          <p className="auth-subtitle">Track tasks, deadlines, calendar, and progress across all your projects.</p>

          <form className="auth-form" onSubmit={submit}>
            <label className="field-label-v2" htmlFor="signinEmail">Email</label>
            <input
              id="signinEmail"
              className="field-input-v2"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="field-label-v2" htmlFor="signinPassword">Password</label>
            <input
              id="signinPassword"
              className="field-input-v2"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="error-text-v2">{error}</p>}
            <button className="primary-btn-v2" type="submit">Sign In</button>
          </form>

          <p className="auth-footnote">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
