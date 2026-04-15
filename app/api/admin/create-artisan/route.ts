import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const createArtisanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// POST /api/admin/create-artisan — create a new artisan account (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = (session.user as any).role as Role
  if (role !== 'ADMIN') {
    return Response.json({ error: 'Admin access required' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createArtisanSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { name, email, password } = parsed.data

  // Check for duplicate email
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ error: 'A user with this email already exists' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)

  const artisan = await db.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: 'ARTISAN',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  return Response.json({ artisan }, { status: 201 })
}
