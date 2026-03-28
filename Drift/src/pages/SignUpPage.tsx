import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../auth'

export default function SignUpPage({ onSignedUp }: { onSignedUp: () => void }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function submit(event: React.FormEvent) {
    event.preventDefault()

    if (password.length < 6) {
      setError('Password must have at least 6 characters.')
      return
    }

    const result = signUp({ name, email, password })
    if (!result.ok) {
      setError(result.message ?? 'Sign up failed.')
      return
    }

    onSignedUp()
    navigate('/app/dashboard')
  }

  return (
    <div className="auth-screen">
      <div className="auth-layout panel-v2">
        <aside className="auth-art">
          <p className="auth-kicker">Built for students</p>
          <h2 className="auth-art-title">Create your planning space.</h2>
          <p className="auth-art-text">Track due dates, monitor progress, and use the calendar view to avoid last-minute stress.</p>
          <div className="auth-pill-row">
            <span>Due dates</span>
            <span>Milestones</span>
            <span>Results</span>
          </div>
        </aside>

        <div className="auth-panel">
          <p className="auth-kicker">Create account</p>
          <h1 className="auth-title">Start with Drift</h1>
          <p className="auth-subtitle">Organize assignments and never miss deadlines again.</p>

          <form className="auth-form" onSubmit={submit}>
            <label className="field-label-v2" htmlFor="signupName">Full name</label>
            <input
              id="signupName"
              className="field-input-v2"
              type="text"
              placeholder="Rashi Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label className="field-label-v2" htmlFor="signupEmail">Email</label>
            <input
              id="signupEmail"
              className="field-input-v2"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="field-label-v2" htmlFor="signupPassword">Password</label>
            <input
              id="signupPassword"
              className="field-input-v2"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="error-text-v2">{error}</p>}
            <button className="primary-btn-v2" type="submit">Sign Up</button>
          </form>

          <p className="auth-footnote">
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
