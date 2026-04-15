import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Role } from '@prisma/client'

// GET /api/artisans — list all artisans (admin only)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = (session.user as any).role as Role
  if (role !== 'ADMIN') {
    return Response.json({ error: 'Admin access required' }, { status: 403 })
  }

  const artisans = await db.user.findMany({
    where: { role: 'ARTISAN' },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { assigned: true } },
    },
    orderBy: { name: 'asc' },
  })

  return Response.json({ artisans })
}
