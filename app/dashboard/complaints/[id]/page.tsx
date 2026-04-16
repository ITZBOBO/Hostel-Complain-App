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
  student: { name: string; email: string; matricNo: string | null }
  artisan: { name: string; email: string } | null
}

export default function ComplaintDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/complaints/${params.id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then((data) => {
        if (data) setComplaint(data.complaint)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="bg-white rounded-xl border border-gray-200 h-40" />
        <div className="bg-white rounded-xl border border-gray-200 h-32" />
      </div>
    )
  }

  if (notFound || !complaint) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <i className="fa-solid fa-magnifying-glass text-5xl text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Complaint Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">This complaint does not exist or you don't have access to it.</p>
        <button onClick={() => router.push('/dashboard/complaints')} className="bg-[#0D1F3C] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#112240] transition-colors">
          Back to My Complaints
        </button>
      </div>
    )
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

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
        My Complaints
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-mono text-gray-500 mb-1">{complaint.complaintId}</p>
            <h1 className="text-xl font-bold text-[#0D1F3C]">{complaint.title}</h1>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        {/* Status Stepper */}
        <div className="mt-6 mb-2">
          <StatusStepper currentStatus={complaint.status} />
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
          Details
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Category</p>
            <p className="font-medium text-gray-800">
              <i className={`fa-solid ${CATEGORY_ICONS[complaint.category]} mr-1.5`} />{complaint.category}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Subcategory</p>
            <p className="font-medium text-gray-800">{complaint.subCategory}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Block</p>
            <p className="font-medium text-gray-800">Block {complaint.block}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Room Number</p>
            <p className="font-medium text-gray-800">{complaint.roomNumber}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Submitted</p>
            <p className="font-medium text-gray-800">{formatDate(complaint.createdAt)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Last Updated</p>
            <p className="font-medium text-gray-800">{formatDate(complaint.updatedAt)}</p>
          </div>
        </div>

        <div>
          <p className="text-gray-500 text-xs mb-1">Description</p>
          <p className="text-gray-700 text-sm leading-relaxed">{complaint.description}</p>
        </div>
      </div>

      {/* Artisan Info */}
      {complaint.artisan && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-5">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
            Assigned Artisan
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
              {complaint.artisan.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-blue-900 text-sm">{complaint.artisan.name}</p>
              <p className="text-xs text-blue-600">{complaint.artisan.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Photo */}
      {complaint.photoUrl && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">Photo</h2>
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
