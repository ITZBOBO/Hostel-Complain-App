import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function GET() {
  const password = await bcrypt.hash('password123', 10)

  const user = await db.user.upsert({
    where: { email: 'test@run.edu.ng' },
    update: {},
    create: {
      name: 'Test Student',
      email: 'test@run.edu.ng',
      matricNo: 'RUN/CSC/21/0001',
      password,
      role: 'STUDENT',
    },
  })

  const admin = await db.user.upsert({
    where: { email: 'admin@run.edu.ng' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@run.edu.ng',
      matricNo: null,
      password,
      role: 'ADMIN',
    },
  })

  return NextResponse.json({ message: 'Seed successful', user, admin })
}