'use client'

import { ComplaintStatus } from '@prisma/client'

const CONFIG: Record<
  ComplaintStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  SUBMITTED: {
    label: 'Submitted',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  ASSIGNED: {
    label: 'Assigned',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
  },
  RESOLVED: {
    label: 'Resolved',
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
}

interface StatusBadgeProps {
  status: ComplaintStatus
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { label, bg, text, dot } = CONFIG[status]
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${padding} ${bg} ${text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
