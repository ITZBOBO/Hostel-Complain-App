'use client'

import Link from 'next/link'
import { StatusBadge } from './StatusBadge'
import { ComplaintStatus, ComplaintCategory } from '@prisma/client'

const CATEGORY_ICONS: Record<ComplaintCategory, string> = {
  FURNITURE: 'fa-chair',
  PLUMBING: 'fa-shower',
  ELECTRICITY: 'fa-bolt',
  WELDING: 'fa-wrench',
  OTHERS: 'fa-box',
}

interface ComplaintCardProps {
  id: string
  complaintId: string
  title: string
  block: string
  roomNumber: string
  category: ComplaintCategory
  subCategory: string
  status: ComplaintStatus
  createdAt: string | Date
  href: string
  artisanName?: string | null
}

export function ComplaintCard({
  complaintId,
  title,
  block,
  roomNumber,
  category,
  subCategory,
  status,
  createdAt,
  href,
  artisanName,
}: ComplaintCardProps) {
  const date = new Date(createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Link
      href={href}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#0D1F3C]/30 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-[#0D1F3C]/8 text-[#0D1F3C]">
            <i className={`fa-solid ${CATEGORY_ICONS[category]} text-base`} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-mono text-gray-400 mb-0.5">{complaintId}</p>
            <h3 className="font-semibold text-[#0D1F3C] truncate group-hover:text-[#112240] transition-colors">
              {title}
            </h3>
          </div>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>
          <i className="fa-solid fa-location-dot mr-1" />
          Block {block}, Room {roomNumber}
        </span>
        <span>
          <i className="fa-solid fa-tag mr-1" />
          {category} — {subCategory}
        </span>
        {artisanName && (
          <span>
            <i className="fa-solid fa-hard-hat mr-1" />
            {artisanName}
          </span>
        )}
        <span className="ml-auto">{date}</span>
      </div>
    </Link>
  )
}
