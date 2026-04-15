import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StudentNav } from '@/components/StudentNav'
import { db } from '@/lib/db'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const sessionUser = session.user as any
  
  const user = await db.user.findUnique({
    where: { id: sessionUser.id }
  })

  if (!user) redirect('/login')

  return (
    // Clean, modern soft background
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Modern Deep Blue Header */}
      <header className="sticky top-0 z-50 w-full bg-[#0D1F3C] backdrop-blur-xl shadow-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand / Logo */}
          <Link href="/dashboard/complaints" className="flex items-center gap-1.5 md:gap-3 group shrink-0">
            {/* Using a reliable remotely fetched RUN logo but sized modernly */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="bg-white/95 p-1 rounded-full flex items-center justify-center shadow-md">
              <img 
                src="/redeemers-logo.png" 
                alt="Redeemer's University" 
                className="h-8 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 
                className="font-black text-white leading-none tracking-wider text-2xl m-0" 
                style={{ 
                  fontFamily: '"Impact", "Arial Black", sans-serif',
                  textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                REDEEMER&apos;S
              </h1>
              <h1 
                className="font-black text-white leading-none tracking-[0.16em] text-[1.15rem] m-0 mt-0.5" 
                style={{ 
                  fontFamily: '"Impact", "Arial Black", sans-serif',
                  textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                UNIVERSITY
              </h1>
            </div>
          </Link>

          {/* Center Navigation - Pill style */}
          <nav className="flex items-center gap-1 md:gap-2 absolute left-1/2 -translate-x-1/2 shrink-0">
             <Link 
                href="/dashboard/complaints" 
                className="px-2 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-[15px] font-medium text-blue-100 hover:text-white hover:bg-white/10 transition-all truncate"
             >
               My Complaints
             </Link>
             <Link 
                href="/dashboard/complaints/new" 
                className="px-2 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-[15px] font-semibold bg-amber-500 text-white hover:bg-amber-600 shadow-md transition-all ml-1 flex items-center gap-1 md:gap-2 truncate"
             >
               <i className="fa-solid fa-plus text-[10px] md:text-sm" /> <span className="hidden sm:inline">New Complaint</span><span className="sm:hidden">New</span>
             </Link>
          </nav>

          {/* Right Navigation Trigger / Nav + User Info */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            
            <div className="text-right">
              <p className="text-[11px] md:text-[15px] font-bold text-white truncate max-w-[60px] md:max-w-none">{user.name.split(' ')[0]}</p>
              <p className="hidden md:block text-[13px] text-blue-200 font-medium tracking-wide">{user.matricNo}</p>
            </div>
            <div className="scale-75 md:scale-100 origin-right">
              <StudentNav userName={user.name} photoUrl={user.photo} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 md:px-6 lg:px-8 py-6 md:py-10 flex flex-row gap-3 md:gap-6 lg:gap-10">
        
        {/* Left Sidebar: Modern Student Profile Card */}
        <aside className="w-[35%] md:w-72 lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200/60 p-3 md:p-6 sticky top-24 flex flex-col items-center relative overflow-hidden group hover:shadow-md transition-shadow">
            
            {/* Subtle Gradient Header inside Card */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-[#0D1F3C] to-[#1e3a8a] opacity-95"></div>

            {/* Profile Avatar */}
            <div className="relative mt-8 mb-4 z-10 w-28 h-28 rounded-full border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                {user.photo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <i className="fa-solid fa-user text-4xl text-slate-400" />
                )}
            </div>

            {/* Name & Badge */}
            <h2 className="font-bold text-[#0D1F3C] text-xl text-center leading-tight mb-1">{user.name}</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-6">
              <i className="fa-solid fa-circle-check" /> Active Student
            </span>

            {/* Structured Details */}
            <div className="w-full space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                
                <div className="flex flex-col gap-1 mb-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Matriculation No.</span>
                  <span className="text-sm font-semibold text-slate-800 font-mono bg-white px-2 py-1 rounded-md border border-slate-200 inline-block w-fit">
                    {user.matricNo}
                  </span>
                </div>

                <div className="flex flex-col gap-1 mb-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department</span>
                  <span className="text-sm font-semibold text-slate-700 leading-snug">
                    {user.department || '—'}
                  </span>
                </div>

                <div className="flex flex-col gap-1 mb-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Programme</span>
                  <span className="text-sm font-semibold text-slate-700 leading-snug">
                    {user.programme || '—'}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic Level</span>
                  <span className="text-sm font-bold text-[#0D1F3C] flex items-center gap-2">
                    <i className="fa-solid fa-graduation-cap text-[#0D1F3C]/50" />
                    {user.level || '—'}
                  </span>
                </div>
              </div>
            </div>



          </div>
        </aside>

        {/* Right Content Area (Complaints List / Forms) */}
        <div className="flex-1 min-w-0">
          {children}
        </div>

      </main>

      {/* Clean Footer */}
      <footer className="mt-auto py-8 text-center bg-white border-t border-slate-200/60">
        <p className="text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} Redeemer's University. Designed for Hostel Services.
        </p>
      </footer>
    </div>
  )
}
