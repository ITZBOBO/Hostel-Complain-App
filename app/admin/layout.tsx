import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminSidebarNav } from '@/components/AdminSidebarNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = session.user as any
  if (user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0D1F3C] flex flex-col flex-shrink-0 fixed h-full z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">RUN Hostel</p>
              <p className="text-gray-400 text-xs mt-0.5">Admin Portal</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <AdminSidebarNav />

        {/* User Info */}
        <div className="mt-auto px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(user.name as string)[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-gray-400 text-xs">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-8">
          {children}
        </main>
        <footer className="text-center text-xs text-gray-400 py-4">
          © 2026 Redeemer's University Nigeria — Admin Portal
        </footer>
      </div>
    </div>
  )
}
