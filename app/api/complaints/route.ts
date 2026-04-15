import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateComplaintId } from '@/lib/complaint-id'
import { sendAdminNewComplaintEmail } from '@/lib/email'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ComplaintCategory, Role } from '@prisma/client'

const createComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  block: z.coerce.number().int().min(1).max(100),
  roomNumber: z.string().min(1, 'Room number is required'),
  category: z.nativeEnum(ComplaintCategory),
  subCategory: z.string().min(1, 'Subcategory is required'),
  photoUrl: z.string().url().optional().or(z.literal('')),
})

// POST /api/complaints — create a new complaint (student only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = (session.user as any).role as Role
  if (role !== 'STUDENT') {
    return Response.json({ error: 'Only students can submit complaints' }, { status: 403 })
  }

  const userId = (session.user as any).id as string

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createComplaintSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { title, description, block, roomNumber, category, subCategory, photoUrl } =
    parsed.data

  const complaintId = await generateComplaintId()

  const complaint = await db.complaint.create({
    data: {
      complaintId,
      title,
      description,
      block: String(block),
      roomNumber,
      category,
      subCategory,
      photoUrl: photoUrl || null,
      studentId: userId,
    },
    include: {
      student: { select: { name: true, email: true } },
    },
  })

  // Send email notification to admin (fire-and-forget)
  sendAdminNewComplaintEmail({
    complaintId,
    title,
    block: String(block),
    roomNumber,
    category,
    studentName: complaint.student.name,
    studentEmail: complaint.student.email,
  })

  return Response.json({ complaint }, { status: 201 })
}

// GET /api/complaints — fetch complaints based on role
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id as string
  const role = (session.user as any).role as Role

  const { searchParams } = req.nextUrl
  const statusFilter = searchParams.get('status') || undefined
  const categoryFilter = searchParams.get('category') || undefined
  const blockFilter = searchParams.get('block') || undefined

  // Build shared include
  const include = {
    student: { select: { id: true, name: true, email: true, matricNo: true } },
    artisan: { select: { id: true, name: true, email: true } },
  }

  let complaints

  if (role === 'STUDENT') {
    complaints = await db.complaint.findMany({
      where: { studentId: userId },
      include,
      orderBy: { createdAt: 'desc' },
    })
  } else if (role === 'ADMIN') {
    complaints = await db.complaint.findMany({
      where: {
        ...(statusFilter && { status: statusFilter as any }),
        ...(categoryFilter && { category: categoryFilter as any }),
        ...(blockFilter && { block: blockFilter }),
      },
      include,
      orderBy: { createdAt: 'desc' },
    })
  } else if (role === 'ARTISAN') {
    complaints = await db.complaint.findMany({
      where: { artisanId: userId },
      include,
      orderBy: { createdAt: 'desc' },
    })
  } else {
    return Response.json({ error: 'Unknown role' }, { status: 403 })
  }

  return Response.json({ complaints })
}
