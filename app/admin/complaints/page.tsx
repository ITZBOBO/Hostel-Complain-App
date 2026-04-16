'use client'

import { useEffect, useState } from 'react'
import { ComplaintCard } from '@/components/ComplaintCard'
import { ComplaintCategory, ComplaintStatus } from '@prisma/client'

const STATUSES = ['', 'SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] as const
const CATEGORIES = ['', 'FURNITURE', 'PLUMBING', 'ELECTRICITY', 'WELDING', 'OTHERS'] as const

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
  student: { name: string; matricNo: string | null }
  artisan: { name: string } | null
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [blockFilter, setBlockFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (categoryFilter) params.set('category', categoryFilter)
    if (blockFilter) params.set('block', blockFilter)

    fetch(`/api/complaints?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setComplaints(data.complaints || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [statusFilter, categoryFilter, blockFilter])

  const filtered = complaints.filter(
    (c) =>
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.complaintId.toLowerCase().includes(search.toLowerCase()) ||
      c.student.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0D1F3C]">All Complaints</h1>
        <p className="text-gray-600 text-sm mt-1">
          {loading ? 'Loading...' : `${filtered.length} complaint${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by title, ID, student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] transition-all"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] transition-all bg-white"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] transition-all bg-white"
          >
            <option value="">All Categories</option>
            <option value="FURNITURE">Furniture</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="ELECTRICITY">Electricity</option>
            <option value="WELDING">Welding</option>
            <option value="OTHERS">Others</option>
          </select>
          <input
            type="number"
            placeholder="Filter by block (1–100)"
            min={1}
            max={100}
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] transition-all"
          />
        </div>
        {(statusFilter || categoryFilter || blockFilter || search) && (
          <button
            onClick={() => { setStatusFilter(''); setCategoryFilter(''); setBlockFilter(''); setSearch('') }}
            className="mt-3 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            ✕ Clear all filters
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <i className="fa-solid fa-magnifying-glass text-3xl text-gray-300 mb-3" />
          <p className="font-semibold text-gray-700 mb-1">No complaints found</p>
          <p className="text-sm text-gray-500">Try adjusting your filters</p>
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
              href={`/admin/complaints/${c.id}`}
              artisanName={c.artisan?.name}
            />
          ))}
        </div>
      )}
    </div>
  )
}
