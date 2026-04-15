import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StatusBadge } from '@/components/StatusBadge'
import { ComplaintStatus } from '@prisma/client'

const STATUS_ORDER: ComplaintStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
]

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const user = session.user as any
  if (user.role !== 'ADMIN') redirect('/dashboard')

  // Fetch stats
  const [total, submitted, underReview, assigned, inProgress, resolved, recent] =
    await Promise.all([
      db.complaint.count(),
      db.complaint.count({ where: { status: 'SUBMITTED' } }),
      db.complaint.count({ where: { status: 'UNDER_REVIEW' } }),
      db.complaint.count({ where: { status: 'ASSIGNED' } }),
      db.complaint.count({ where: { status: 'IN_PROGRESS' } }),
      db.complaint.count({ where: { status: 'RESOLVED' } }),
      db.complaint.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { name: true, matricNo: true } },
          artisan: { select: { name: true } },
        },
      }),
    ])

  const pending = submitted + underReview
  const active = assigned + inProgress

  const STAT_CARDS = [
    { label: 'Total Complaints', value: total, color: 'text-[#0D1F3C]', bg: 'bg-white', border: 'border-gray-200', icon: 'fa-clipboard-list' },
    { label: 'Pending Review', value: pending, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: 'fa-clock' },
    { label: 'In Progress', value: active, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: 'fa-wrench' },
    { label: 'Resolved', value: resolved, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: 'fa-circle-check' },
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0D1F3C]">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of all hostel facility complaints — Redeemer's University
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STAT_CARDS.map(({ label, value, color, bg, border, icon }) => (
          <div key={label} className={`rounded-2xl ${bg} border ${border} p-5`}>
            <div className="flex items-center justify-between mb-3">
              <i className={`fa-solid ${icon} text-xl ${color}`} />
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Status Breakdown
        </h2>
        <div className="space-y-3">
          {[
            { status: 'SUBMITTED' as ComplaintStatus, count: submitted },
            { status: 'UNDER_REVIEW' as ComplaintStatus, count: underReview },
            { status: 'ASSIGNED' as ComplaintStatus, count: assigned },
            { status: 'IN_PROGRESS' as ComplaintStatus, count: inProgress },
            { status: 'RESOLVED' as ComplaintStatus, count: resolved },
          ].map(({ status, count }) => (
            <div key={status} className="flex items-center gap-4">
              <div className="w-32 flex-shrink-0">
                <StatusBadge status={status} size="sm" />
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-[#0D1F3C] h-2 rounded-full transition-all"
                  style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700 w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Recent Complaints
          </h2>
          <Link
            href="/admin/complaints"
            className="text-xs text-[#0D1F3C] font-semibold hover:underline"
          >
            View All →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recent.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              No complaints yet.
            </div>
          ) : (
            recent.map((c) => (
              <Link
                key={c.id}
                href={`/admin/complaints/${c.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-gray-400">{c.complaintId}</p>
                  <p className="font-semibold text-sm text-[#0D1F3C] truncate">{c.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {c.student.name} · Block {c.block}, Room {c.roomNumber}
                  </p>
                </div>
                <StatusBadge status={c.status} size="sm" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
