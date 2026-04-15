'use client'

import { ComplaintStatus } from '@prisma/client'

const STEPS: { status: ComplaintStatus; label: string }[] = [
  { status: 'SUBMITTED', label: 'Submitted' },
  { status: 'UNDER_REVIEW', label: 'Under Review' },
  { status: 'ASSIGNED', label: 'Assigned' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'RESOLVED', label: 'Resolved' },
]

const ORDER: Record<ComplaintStatus, number> = {
  SUBMITTED: 0,
  UNDER_REVIEW: 1,
  ASSIGNED: 2,
  IN_PROGRESS: 3,
  RESOLVED: 4,
}

interface StatusStepperProps {
  currentStatus: ComplaintStatus
}

export function StatusStepper({ currentStatus }: StatusStepperProps) {
  const currentIndex = ORDER[currentStatus]

  return (
    <div className="w-full">
      <div className="flex items-start justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-[#0D1F3C] z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex
          const isActive = idx === currentIndex

          return (
            <div key={step.status} className="flex flex-col items-center z-10 flex-1">
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isDone
                    ? 'bg-[#0D1F3C] border-[#0D1F3C]'
                    : isActive
                    ? 'bg-white border-[#0D1F3C] shadow-md shadow-[#0D1F3C]/20'
                    : 'bg-white border-gray-300'
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isActive ? 'bg-[#0D1F3C]' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
              {/* Label */}
              <span
                className={`mt-2 text-xs font-medium text-center leading-tight ${
                  isDone || isActive ? 'text-[#0D1F3C]' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
