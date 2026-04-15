'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import { StatusStepper } from '@/components/StatusStepper'
import { ComplaintStatus, ComplaintCategory } from '@prisma/client'
import Image from 'next/image'

const CATEGORY_ICONS: Record<ComplaintCategory, string> = {
  FURNITURE: 'fa-chair',
  PLUMBING: 'fa-shower',
  ELECTRICITY: 'fa-bolt',
  WELDING: 'fa-wrench',
  OTHERS: 'fa-box',
}

// Artisans can only move status forward
const ALLOWED_NEXT: Record<ComplaintStatus, ComplaintStatus[]> = {
  SUBMITTED: [],
  UNDER_REVIEW: [],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: [],
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
  student: { name: string; matricNo: string | null }
}

export default function ArtisanComplaintDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveMsgOk, setSaveMsgOk] = useState(false)

  useEffect(() => {
    fetch(`/api/complaints/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setComplaint(data.complaint || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleStatusUpdate = async (newStatus: ComplaintStatus) => {
    if (!complaint) return
    setSaving(true)
    setSaveMsg('')

    try {
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (res.ok) {
        setComplaint(data.complaint)
        setSaveMsg('Status updated successfully!')
        setSaveMsgOk(true)
      } else {
        setSaveMsg(data.error || 'Failed to update status')
        setSaveMsgOk(false)
      }
    } catch {
      setSaveMsg('Network error. Please try again.')
      setSaveMsgOk(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="bg-white rounded-xl border border-gray-200 h-48" />
        <div className="bg-white rounded-xl border border-gray-200 h-32" />
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <i className="fa-solid fa-magnifying-glass text-4xl text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Task Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">
          This complaint was not found or is not assigned to you.
        </p>
        <button
          onClick={() => router.push('/artisan')}
          className="bg-[#0D1F3C] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#112240] transition-colors"
        >
          Back to My Tasks
        </button>
      </div>
    )
  }

  const allowedNext = ALLOWED_NEXT[complaint.status]
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0D1F3C] transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        My Tasks
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-mono text-gray-400 mb-1">{complaint.complaintId}</p>
            <h1 className="text-xl font-bold text-[#0D1F3C]">{complaint.title}</h1>
          </div>
          <StatusBadge status={complaint.status} />
        </div>
        <div className="mt-6">
          <StatusStepper currentStatus={complaint.status} />
        </div>
      </div>

      {/* Update Status Action */}
      <div
        className={`rounded-xl border p-5 mb-5 ${
          complaint.status === 'RESOLVED'
            ? 'bg-green-50 border-green-100'
            : allowedNext.length > 0
            ? 'bg-amber-50 border-amber-100'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h2>

        {complaint.status === 'RESOLVED' ? (
          <div className="flex items-center gap-2 text-green-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold">This complaint has been resolved. Great work!</span>
          </div>
        ) : allowedNext.length === 0 ? (
          <p className="text-sm text-gray-500">
            Waiting for admin to assign this complaint to you before you can update the status.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Mark this complaint as the next stage in the workflow:
            </p>
            <div className="flex flex-wrap gap-2">
              {allowedNext.map((nextStatus) => (
                <button
                  key={nextStatus}
                  id={`update-status-${nextStatus}`}
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={saving}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                    nextStatus === 'RESOLVED'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-[#0D1F3C] text-white hover:bg-[#112240]'
                  }`}
                >
                  {saving
                    ? 'Updating...'
                    : nextStatus === 'IN_PROGRESS'
                    ? (<><i className="fa-solid fa-wrench mr-1.5" />Mark as In Progress</>)
                    : (<><i className="fa-solid fa-circle-check mr-1.5" />Mark as Resolved</>)}
                </button>
              ))}
            </div>
          </div>
        )}

        {saveMsg && (
          <p
            className={`mt-3 text-sm font-medium flex items-center gap-1.5 ${
              saveMsgOk ? 'text-green-700' : 'text-red-600'
            }`}
          >
            <i className={`fa-solid ${saveMsgOk ? 'fa-circle-check' : 'fa-circle-xmark'}`} />
            {saveMsg}
          </p>
        )}
      </div>

      {/* Complaint Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Complaint Details
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Student</p>
            <p className="font-medium text-gray-800">
              {complaint.student.name}
              {complaint.student.matricNo && (
                <span className="text-gray-400 font-normal"> · {complaint.student.matricNo}</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Category</p>
            <p className="font-medium text-gray-800">
              <i className={`fa-solid ${CATEGORY_ICONS[complaint.category]} mr-1.5`} />{complaint.category} — {complaint.subCategory}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Block / Room</p>
            <p className="font-medium text-gray-800">
              Block {complaint.block}, Room {complaint.roomNumber}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Submitted</p>
            <p className="font-medium text-gray-800">{formatDate(complaint.createdAt)}</p>
          </div>
        </div>

        <div>
          <p className="text-gray-400 text-xs mb-1">Description</p>
          <p className="text-gray-700 text-sm leading-relaxed">{complaint.description}</p>
        </div>
      </div>

      {/* Photo */}
      {complaint.photoUrl && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Photo</h2>
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <Image
              src={complaint.photoUrl}
              alt="Complaint photo"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}
    </div>
  )
}
