import { db } from '@/lib/db'

/**
 * Generates a unique complaint ID in the format HFC-YYYY-XXXX
 * e.g. HFC-2026-0001
 */
export async function generateComplaintId(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `HFC-${year}-`

  // Count complaints created this year to determine next sequential number
  const count = await db.complaint.count({
    where: {
      complaintId: {
        startsWith: prefix,
      },
    },
  })

  const next = String(count + 1).padStart(4, '0')
  return `${prefix}${next}`
}
