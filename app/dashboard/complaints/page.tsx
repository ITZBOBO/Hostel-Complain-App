'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ComplaintCard } from '@/components/ComplaintCard'
import { ComplaintStatus } from '@prisma/client'

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
]

interface Complaint {
  id: string
  complaintId: string
  title: string
  block: string
  roomNumber: string
  category: any
  subCategory: string
  status: ComplaintStatus
  createdAt: string
  artisan?: { name: string } | null
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetch('/api/complaints')
      .then((r) => r.json())
      .then((data) => {
        setComplaints(data.complaints || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered =
    activeTab === 'all'
      ? complaints
      : complaints.filter((c) => c.status === activeTab)

  const counts = STATUS_TABS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab.value] =
      tab.value === 'all'
        ? complaints.length
        : complaints.filter((c) => c.status === tab.value).length
    return acc
  }, {})

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3C]">My Complaints</h1>
          <p className="text-gray-600 text-sm mt-1">
            Track and manage all your submitted facility complaints
          </p>
        </div>
        <Link
          href="/dashboard/complaints/new"
          className="inline-flex items-center gap-2 bg-[#0D1F3C] text-white px-5 min-h-[48px] rounded-xl font-semibold text-sm hover:bg-[#112240] transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Complaint
        </Link>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', count: complaints.length, color: 'text-[#0D1F3C]', bg: 'bg-white', border: 'border-gray-200' },
            { label: 'Pending', count: complaints.filter(c => ['SUBMITTED','UNDER_REVIEW'].includes(c.status)).length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
            { label: 'In Progress', count: complaints.filter(c => ['ASSIGNED','IN_PROGRESS'].includes(c.status)).length, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
            { label: 'Resolved', count: complaints.filter(c => c.status === 'RESOLVED').length, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
          ].map(({ label, count, color, bg, border }) => (
            <div key={label} className={`rounded-xl ${bg} border ${border} p-4`}>
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
              <p className="text-xs text-gray-600 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-shrink-0 px-5 min-h-[48px] rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.value
                ? 'bg-[#0D1F3C] text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#0D1F3C]/30 hover:text-[#0D1F3C]'
            }`}
          >
            {tab.label}
            {counts[tab.value] > 0 && (
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <i className="fa-solid fa-clipboard-list text-4xl text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">
            {activeTab === 'all' ? 'No complaints yet' : `No ${activeTab.replace('_', ' ').toLowerCase()} complaints`}
          </h3>
          <p className="text-sm text-gray-500 mb-5">Submit a new complaint to get started.</p>
          <Link
            href="/dashboard/complaints/new"
            className="inline-flex items-center justify-center gap-2 bg-[#0D1F3C] text-white px-6 min-h-[48px] rounded-xl font-semibold text-sm hover:bg-[#112240] transition-colors"
          >
            + New Complaint
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <ComplaintCard
              key={c.id}
              id={c.id}
              complaintId={c.complaintId}
              title={c.title}
              block={c.block}
              roomNumber={c.roomNumber}
              category={c.category}
              subCategory={c.subCategory}
              status={c.status}
              createdAt={c.createdAt}
              href={`/dashboard/complaints/${c.id}`}
              artisanName={c.artisan?.name}
            />
          ))}
        </div>
      )}
    </div>
  )
}