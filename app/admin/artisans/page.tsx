'use client'

import { useEffect, useState } from 'react'

interface Artisan {
  id: string
  name: string
  email: string
  createdAt: string
  _count: { assigned: number }
}

export default function AdminArtisansPage() {
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchArtisans = () => {
    setLoading(true)
    fetch('/api/artisans')
      .then((r) => r.json())
      .then((data) => { setArtisans(data.artisans || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchArtisans() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/create-artisan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        const msg = data.details
          ? Object.values(data.details).flat().join(', ')
          : data.error || 'Failed to create artisan'
        setError(msg)
        return
      }

      setSuccess(`Artisan "${data.artisan.name}" created successfully!`)
      setForm({ name: '', email: '', password: '' })
      setShowForm(false)
      fetchArtisans()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3C]">Artisans</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage artisan accounts and view their assigned complaints
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
          className="flex items-center gap-2 bg-[#0D1F3C] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#112240] transition-colors"
        >
          <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'} mr-2`} />
          {showForm ? 'Cancel' : 'Add Artisan'}
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          {success}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            New Artisan Account
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
              <input
                id="artisan-name"
                required
                type="text"
                placeholder="e.g. John Adeyemi"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
              <input
                id="artisan-email"
                required
                type="email"
                placeholder="artisan@run.edu.ng"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
              <input
                id="artisan-password"
                required
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C]"
              />
            </div>
            {error && (
              <div className="sm:col-span-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm">
                {error}
              </div>
            )}
            <div className="sm:col-span-3">
              <button
                id="create-artisan-btn"
                type="submit"
                disabled={creating}
                className="bg-[#0D1F3C] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#112240] disabled:opacity-50 transition-colors"
              >
                {creating ? 'Creating...' : 'Create Artisan Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Artisan List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-20" />
          ))}
        </div>
      ) : artisans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <i className="fa-solid fa-hard-hat text-3xl text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No artisans yet</h3>
          <p className="text-sm text-gray-400 mb-5">Create your first artisan account to start assigning complaints.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#0D1F3C] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#112240] transition-colors"
          >
            + Add Artisan
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned Tasks</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {artisans.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0D1F3C]/10 flex items-center justify-center text-[#0D1F3C] font-bold text-sm">
                        {a.name[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{a.email}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${a._count.assigned > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                      {a._count.assigned}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
