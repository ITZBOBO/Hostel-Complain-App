'use client'

import { useEffect, useState } from 'react'
import { ComplaintCard } from '@/components/ComplaintCard'
import { ComplaintStatus, ComplaintCategory } from '@prisma/client'

interface Complaint {
  id: string
  complaintId: string
  title: string
  block: string
  roomNumber: string
  category: ComplaintCategory
  subCategory: string
  status: ComplaintStatus
  createdAt: string
  student: { name: string }
}

const STATUS_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
]

export default function ArtisanDashboardPage() {
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

  const pending = complaints.filter((c) =>
    ['ASSIGNED', 'IN_PROGRESS'].includes(c.status)
  ).length
  const resolved = complaints.filter((c) => c.status === 'RESOLVED').length

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0D1F3C]">My Assigned Tasks</h1>
        <p className="text-gray-500 text-sm mt-1">
          Complaints assigned to you — update the status as you work on them
        </p>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-[#0D1F3C]">{complaints.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Assigned</p>
          </div>
          <div className="bg-orange-50 rounded-xl border border-orange-100 p-4">
            <p className="text-2xl font-bold text-orange-600">{pending}</p>
            <p className="text-xs text-gray-500 mt-0.5">Active Tasks</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-100 p-4">
            <p className="text-2xl font-bold text-green-600">{resolved}</p>
            <p className="text-xs text-gray-500 mt-0.5">Resolved</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.value
                ? 'bg-[#0D1F3C] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#0D1F3C]/30 hover:text-[#0D1F3C]'
            }`}
          >
            {tab.label}
            {counts[tab.value] > 0 && (
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.value ? 'bg-white/20' : 'bg-gray-100'
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
          <i className="fa-solid fa-wrench text-3xl text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">
            {activeTab === 'all' ? 'No tasks assigned yet' : `No ${activeTab.replace('_', ' ').toLowerCase()} tasks`}
          </h3>
          <p className="text-sm text-gray-400">
            The admin will assign complaints to you. Check back soon.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <ComplaintCard
              key={c.id}
              id={c.id}
              complaintId={c.complaintId}
              title={`${c.title} — ${c.student.name}`}
              block={c.block}
              roomNumber={c.roomNumber}
              category={c.category}
              subCategory={c.subCategory}
              status={c.status}
              createdAt={c.createdAt}
              href={`/artisan/complaints/${c.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
