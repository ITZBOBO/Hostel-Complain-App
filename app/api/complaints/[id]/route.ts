import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendStudentStatusUpdateEmail } from '@/lib/email'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ComplaintStatus, Role } from '@prisma/client'

// GET /api/complaints/[id] — single complaint detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const userId = (session.user as any).id as string
  const role = (session.user as any).role as Role

  const complaint = await db.complaint.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, name: true, email: true, matricNo: true } },
      artisan: { select: { id: true, name: true, email: true } },
    },
  })

  if (!complaint) {
    return Response.json({ error: 'Complaint not found' }, { status: 404 })
  }

  // Authorization: student can only see their own
  if (role === 'STUDENT' && complaint.studentId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Authorization: artisan can only see their assigned
  if (role === 'ARTISAN' && complaint.artisanId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  return Response.json({ complaint })
}

const adminPatchSchema = z.object({
  status: z.nativeEnum(ComplaintStatus).optional(),
  artisanId: z.string().optional().nullable(),
})

const artisanPatchSchema = z.object({
  status: z.nativeEnum(ComplaintStatus),
})

// PATCH /api/complaints/[id] — update status / assign artisan
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const userId = (session.user as any).id as string
  const role = (session.user as any).role as Role

  if (role === 'STUDENT') {
    return Response.json({ error: 'Students cannot update complaints' }, { status: 403 })
  }

  const complaint = await db.complaint.findUnique({
    where: { id },
    include: {
      student: { select: { name: true, email: true } },
    },
  })

  if (!complaint) {
    return Response.json({ error: 'Complaint not found' }, { status: 404 })
  }

  // Artisan can only update their assigned complaint
  if (role === 'ARTISAN' && complaint.artisanId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  let updateData: { status?: ComplaintStatus; artisanId?: string | null } = {}
  const previousStatus = complaint.status

  if (role === 'ADMIN') {
    const parsed = adminPatchSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }
    updateData = parsed.data
  } else if (role === 'ARTISAN') {
    const parsed = artisanPatchSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }
    updateData = parsed.data
  }

  const updated = await db.complaint.update({
    where: { id },
    data: updateData,
    include: {
      student: { select: { name: true, email: true } },
      artisan: { select: { name: true } },
    },
  })

  // Send student notification if status changed
  if (updateData.status && updateData.status !== previousStatus) {
    sendStudentStatusUpdateEmail({
      complaintId: complaint.complaintId,
      title: complaint.title,
      block: complaint.block,
      roomNumber: complaint.roomNumber,
      category: complaint.category,
      studentName: updated.student.name,
      studentEmail: updated.student.email,
      status: updated.status,
    })
  }

  return Response.json({ complaint: updated })
}
