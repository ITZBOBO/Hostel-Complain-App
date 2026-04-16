'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

type Role = 'ADMIN' | 'ARTISAN'

const ROLES: { value: Role; label: string; icon: string; desc: string; redirect: string }[] = [
  {
    value: 'ADMIN',
    label: 'Administrator',
    icon: 'fa-shield-halved',
    desc: 'Manage complaints, users & reports',
    redirect: '/admin',
  },
  {
    value: 'ARTISAN',
    label: 'Artisan / Staff',
    icon: 'fa-wrench',
    desc: 'View & update assigned work orders',
    redirect: '/artisan',
  },
]

export default function StaffLoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      identifier: email,
      password,
      portal: 'staff',
      redirect: false,
    })

    if (res?.error) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    const redirect = ROLES.find((r) => r.value === selectedRole)?.redirect ?? '/dashboard'
    router.push(redirect)
  }

  return (
    <div className="staff-page">
      {/* ── Header ── */}
      <header className="staff-header">
        <div className="staff-header-inner">
          <div className="staff-logo-wrap">
            <Image
              src="/redeemers-logo.png"
              alt="Redeemer's University Logo"
              width={72}
              height={72}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <div className="staff-header-text">
            <h1 className="staff-uni-title">
              <span className="staff-title-line staff-title-line-1">REDEEMER&rsquo;S</span>
              <span className="staff-title-line staff-title-line-2">UNIVERSITY</span>
            </h1>
            <p className="staff-subtitle">Hostel Facility Complaint Portal — Staff Access</p>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="staff-main">
        <div className="staff-card">

          {/* ── Badge ── */}
          <div className="staff-badge">
            <span className="staff-badge-dot" />
            STAFF PORTAL
          </div>

          <h2 className="staff-form-title">Staff Sign In</h2>
          <p className="staff-form-sub">
            Select your role, then enter your credentials to continue.
          </p>
          <div className="staff-form-accent" />

          {/* ── Role Selector ── */}
          <div className="staff-roles">
            {ROLES.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => {
                  setSelectedRole(role.value)
                  setError('')
                }}
                className={`staff-role-btn ${selectedRole === role.value ? 'staff-role-active' : ''}`}
              >
                <span className="staff-role-icon">
                <i className={`fa-solid ${role.icon}`} />
              </span>
                <div className="staff-role-info">
                  <span className="staff-role-label">{role.label}</span>
                  <span className="staff-role-desc">{role.desc}</span>
                </div>
                <div className="staff-role-check">
                  {selectedRole === role.value && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* ── Form ── */}
          {error && (
            <div className="staff-error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className={`staff-form ${!selectedRole ? 'staff-form-locked' : ''}`}
          >
            <div className="staff-field">
              <label htmlFor="staff-email">Email Address</label>
              <input
                id="staff-email"
                type="email"
                placeholder="e.g. admin@run.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!selectedRole}
                autoComplete="username"
              />
            </div>

            <div className="staff-field">
              <label htmlFor="staff-password">Password</label>
              <input
                id="staff-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!selectedRole}
                autoComplete="current-password"
              />
            </div>

            <button
              id="staff-submit-btn"
              type="submit"
              className="staff-submit"
              disabled={loading || !selectedRole}
            >
              {loading ? (
                <span className="staff-submit-loading">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="staff-spin-track" />
                    <path fill="currentColor" className="staff-spin-fill" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>
                  Sign In
                  {selectedRole && (
                    <span className="staff-submit-role">
                      as {ROLES.find((r) => r.value === selectedRole)?.label}
                    </span>
                  )}
                </>
              )}
            </button>
          </form>

          {/* ── Back link ── */}
          <div className="staff-back">
            <Link href="/login" className="staff-back-link">
              ← Back to Student Portal
            </Link>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="staff-footer">
        <p>Copyright © {new Date().getFullYear()} Redeemer&rsquo;s University. All Rights Reserved.</p>
        <p>Hostel Facility Complaint Portal</p>
      </footer>

      <style jsx>{`
        /* ── Page ── */
        .staff-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #060e1e 0%, #0d1f3c 50%, #0b2545 100%);
          font-family: var(--font-inter), 'Inter', sans-serif;
        }

        /* ── Header ── */
        .staff-header {
          background: rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 14px 0;
          backdrop-filter: blur(8px);
        }
        .staff-header-inner {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 28px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .staff-logo-wrap {
          flex-shrink: 0;
          background: rgba(255,255,255,0.9);
          border-radius: 50%;
          padding: 5px;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.2), 0 4px 16px rgba(0,0,0,0.4);
          line-height: 0;
        }
        .staff-header-text {
          display: flex;
          flex-direction: column;
        }
        .staff-uni-title {
          display: flex;
          flex-direction: column;
          margin: 0;
          line-height: 1;
        }
        .staff-title-line {
          font-family: 'Impact', 'Arial Black', sans-serif;
          font-weight: 900;
          color: #fff;
          text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 3px 4px 8px rgba(0,0,0,0.6);
          letter-spacing: 1px;
        }
        .staff-title-line-1 { font-size: 34px; }
        .staff-title-line-2 { font-size: 30px; letter-spacing: 2.5px; }
        .staff-subtitle {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          margin: 5px 0 0 0;
          letter-spacing: 0.3px;
        }

        /* ── Main ── */
        .staff-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        /* ── Card ── */
        .staff-card {
          width: 100%;
          max-width: 480px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 36px 32px;
          backdrop-filter: blur(20px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset;
        }

        /* ── Badge ── */
        .staff-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(250, 204, 21, 0.12);
          border: 1px solid rgba(250, 204, 21, 0.3);
          color: #facc15;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          padding: 4px 10px;
          border-radius: 100px;
          margin-bottom: 20px;
        }
        .staff-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #facc15;
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .staff-form-title {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 6px 0;
        }
        .staff-form-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.85);
          margin: 0 0 20px 0;
        }
        .staff-form-accent {
          height: 3px;
          width: 48px;
          background: linear-gradient(90deg, #facc15, #f59e0b);
          border-radius: 2px;
          margin-bottom: 24px;
        }

        /* ── Role buttons ── */
        .staff-roles {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
        }
        .staff-role-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          cursor: pointer;
          transition: all 200ms ease;
          text-align: left;
          width: 100%;
        }
        .staff-role-btn:hover {
          border-color: rgba(250,204,21,0.4);
          background: rgba(250,204,21,0.06);
        }
        .staff-role-active {
          border-color: #facc15 !important;
          background: rgba(250,204,21,0.1) !important;
          box-shadow: 0 0 0 3px rgba(250,204,21,0.12);
        }
        .staff-role-icon {
          font-size: 22px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.06);
          border-radius: 10px;
          flex-shrink: 0;
        }
        .staff-role-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .staff-role-label {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }
        .staff-role-desc {
          font-size: 12px;
          color: rgba(255,255,255,0.75);
        }
        .staff-role-check {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #facc15;
          transition: all 200ms;
        }
        .staff-role-active .staff-role-check {
          border-color: #facc15;
          background: rgba(250,204,21,0.15);
        }
        .staff-role-check svg {
          width: 12px;
          height: 12px;
        }

        /* ── Error ── */
        .staff-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 16px;
        }
        .staff-error svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        /* ── Form ── */
        .staff-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: opacity 300ms;
        }
        .staff-form-locked {
          opacity: 0.4;
          pointer-events: none;
        }
        .staff-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .staff-field label {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        .staff-field input {
          font-family: inherit;
          font-size: 14px;
          padding: 11px 14px;
          min-height: 48px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          color: #fff;
          outline: none;
          transition: border-color 150ms, box-shadow 150ms;
        }
        .staff-field input::placeholder {
          color: rgba(255,255,255,0.5);
        }
        .staff-field input:focus {
          border-color: rgba(250,204,21,0.5);
          box-shadow: 0 0 0 3px rgba(250,204,21,0.1);
        }
        .staff-field input:disabled {
          cursor: not-allowed;
        }

        /* ── Submit ── */
        .staff-submit {
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 24px;
          background: linear-gradient(135deg, #facc15, #f59e0b);
          color: #0d1f3c;
          font-size: 14px;
          font-weight: 700;
          min-height: 48px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          margin-top: 4px;
          transition: opacity 150ms, transform 150ms, box-shadow 150ms;
          box-shadow: 0 4px 16px rgba(250,204,21,0.25);
        }
        .staff-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(250,204,21,0.35);
        }
        .staff-submit:active:not(:disabled) {
          transform: translateY(0);
        }
        .staff-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .staff-submit-role {
          font-size: 12px;
          font-weight: 500;
          opacity: 0.7;
        }
        .staff-submit-loading {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .staff-submit-loading svg {
          width: 16px;
          height: 16px;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .staff-spin-track { opacity: 0.25; }
        .staff-spin-fill { opacity: 0.75; }

        /* ── Back link ── */
        .staff-back {
          text-align: center;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .staff-back-link {
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          transition: color 150ms;
        }
        .staff-back-link:hover {
          color: rgba(255,255,255,0.95);
        }

        /* ── Footer ── */
        .staff-footer {
          background: rgba(0,0,0,0.3);
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 14px 28px;
          text-align: center;
        }
        .staff-footer p {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          margin: 0;
          line-height: 1.7;
        }

        /* ── Mobile ── */
        @media (max-width: 520px) {
          .staff-main {
            padding: 20px 16px;
          }
          .staff-card {
            padding: 28px 20px;
            border-radius: 16px;
          }
          .staff-title-line-1 { font-size: 26px; }
          .staff-title-line-2 { font-size: 22px; }
          .staff-logo-wrap img { width: 56px; height: 56px; }
        }
      `}</style>
    </div>
  )
}
