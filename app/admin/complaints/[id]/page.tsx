'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import { StatusStepper } from '@/components/StatusStepper'
import { ComplaintStatus, ComplaintCategory } from '@prisma/client'
import Image from 'next/image'

const STATUS_OPTIONS: { value: ComplaintStatus; label: string }[] = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
]

const CATEGORY_ICONS: Record<ComplaintCategory, string> = {
  FURNITURE: 'fa-chair',
  PLUMBING: 'fa-shower',
  ELECTRICITY: 'fa-bolt',
  WELDING: 'fa-wrench',
  OTHERS: 'fa-box',
}

interface Artisan {
  id: string
  name: string
  email: string
  _count: { assigned: number }
}

interface Complaint {
  id: string
  complaintId: string
  title: string
  description: string
  block: string
  roomNumber: string
  category: ComplaintCategory
  subCategory: string
  photoUrl: string | null
  status: ComplaintStatus
  createdAt: string
  updatedAt: string
  artisanId: string | null
  student: { name: string; email: string; matricNo: string | null }
  artisan: { id: string; name: string; email: string } | null
}

export default function AdminComplaintDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | ''>('')
  const [selectedArtisan, setSelectedArtisan] = useState<string>('')
  const [saveMsg, setSaveMsg] = useState('')
  const [saveMsgOk, setSaveMsgOk] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/complaints/${params.id}`).then((r) => r.json()),
      fetch('/api/artisans').then((r) => r.json()),
    ]).then(([complaintData, artisanData]) => {
      if (complaintData.complaint) {
        setComplaint(complaintData.complaint)
        setSelectedStatus(complaintData.complaint.status)
        setSelectedArtisan(complaintData.complaint.artisanId || '')
      }
      setArtisans(artisanData.artisans || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [params.id])

  const handleSave = async () => {
    if (!complaint) return
    setSaving(true)
    setSaveMsg('')

    const body: { status?: ComplaintStatus; artisanId?: string | null } = {}
    if (selectedStatus && selectedStatus !== complaint.status) {
      body.status = selectedStatus as ComplaintStatus
    }
    if (selectedArtisan !== (complaint.artisanId || '')) {
      body.artisanId = selectedArtisan || null
      // Auto-bump status to ASSIGNED when artisan is set
      if (selectedArtisan && !body.status && complaint.status === 'SUBMITTED') {
        body.status = 'UNDER_REVIEW'
      }
    }

    if (Object.keys(body).length === 0) {
      setSaveMsg('No changes to save.')
      setSaving(false)
      return
    }

    try {
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setComplaint(data.complaint)
        setSelectedStatus(data.complaint.status)
        setSelectedArtisan(data.complaint.artisanId || '')
        setSaveMsg('Saved successfully!')
        setSaveMsgOk(true)
      } else {
        setSaveMsg(data.error || 'Failed to save')
        setSaveMsgOk(false)
      }
    } catch {
      setSaveMsg('Network error.')
      setSaveMsgOk(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="bg-white rounded-xl border border-gray-200 h-48" />
        <div className="bg-white rounded-xl border border-gray-200 h-32" />
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="text-center py-20">
        <i className="fa-solid fa-magnifying-glass text-4xl text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Complaint Not Found</h2>
        <button onClick={() => router.push('/admin/complaints')} className="mt-4 bg-[#0D1F3C] text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
          Back to Complaints
        </button>
      </div>
    )
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0D1F3C] transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Complaints
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Complaint Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-mono text-gray-500 mb-1">{complaint.complaintId}</p>
                <h1 className="text-xl font-bold text-[#0D1F3C]">{complaint.title}</h1>
              </div>
              <StatusBadge status={complaint.status} />
            </div>
            <div className="mt-6">
              <StatusStepper currentStatus={complaint.status} />
            </div>
          </div>

          {/* Student Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Student</h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0D1F3C]/10 flex items-center justify-center text-[#0D1F3C] font-bold">
                {complaint.student.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{complaint.student.name}</p>
                <p className="text-xs text-gray-500">{complaint.student.matricNo} · {complaint.student.email}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Category</p>
                <p className="font-medium"><i className={`fa-solid ${CATEGORY_ICONS[complaint.category]} mr-1.5`} />{complaint.category}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Subcategory</p>
                <p className="font-medium">{complaint.subCategory}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Block / Room</p>
                <p className="font-medium">Block {complaint.block}, Room {complaint.roomNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Submitted</p>
                <p className="font-medium">{formatDate(complaint.createdAt)}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Description</p>
              <p className="text-gray-700 text-sm leading-relaxed">{complaint.description}</p>
            </div>
            {complaint.photoUrl && (
              <div className="mt-4">
                <p className="text-gray-500 text-xs mb-2">Photo</p>
                <div className="relative w-full h-52 rounded-xl overflow-hidden">
                  <Image src={complaint.photoUrl} alt="Complaint photo" fill className="object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Manage Complaint
            </h2>

            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
                <select
                  id="admin-status-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 min-h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] bg-white"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Artisan Assignment */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Assign to Artisan
                </label>
                <select
                  id="admin-artisan-select"
                  value={selectedArtisan}
                  onChange={(e) => setSelectedArtisan(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 min-h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] bg-white"
                >
                  <option value="">— Unassigned —</option>
                  {artisans.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a._count.assigned} tasks)
                    </option>
                  ))}
                </select>
                {artisans.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No artisans yet. <a href="/admin/artisans" className="underline">Add one →</a>
                  </p>
                )}
              </div>

              {/* Save */}
              <button
                id="admin-save-btn"
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#0D1F3C] text-white py-2.5 rounded-xl min-h-[44px] font-semibold text-sm hover:bg-[#112240] disabled:opacity-50 transition-all"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              {saveMsg && (
                <p className={`text-xs text-center flex items-center justify-center gap-1 ${saveMsgOk ? 'text-green-600' : 'text-red-600'}`}>
                  <i className={`fa-solid ${saveMsgOk ? 'fa-circle-check' : 'fa-circle-xmark'}`} />
                  {saveMsg}
                </p>
              )}
            </div>
          </div>

          {/* Current Artisan */}
          {complaint.artisan && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">
                Assigned To
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {complaint.artisan.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-blue-900 text-sm">{complaint.artisan.name}</p>
                  <p className="text-xs text-blue-500">{complaint.artisan.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
