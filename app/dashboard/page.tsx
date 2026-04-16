import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'

export default async function StudentHomeDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const sessionUser = session.user as any
  if (sessionUser.role === 'ADMIN') redirect('/admin')
  if (sessionUser.role === 'ARTISAN') redirect('/artisan')

  const userId = sessionUser.id
  if (!userId) {
     const user = await db.user.findUnique({ where: { email: sessionUser.email } })
     if (!user) redirect('/login')
     sessionUser.id = user.id
  }

  // Fetch only this student's complaints
  const complaints = await db.complaint.findMany({
    where: { studentId: sessionUser.id },
    select: { status: true }
  })

  const total = complaints.length
  const pending = complaints.filter(c => ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-[#0D1F3C] mb-2">Welcome back, {sessionUser.name?.split(' ')[0]}!</h1>
      <p className="text-sm text-slate-500 mb-8">Here is an overview of your hostel maintenance requests.</p>

      {/* Primary Mobile App Stats (Natively responsive cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
          <div>
            <p className="text-3xl font-black text-[#0D1F3C]">{total}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Total Requests</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#0D1F3C]">
            <i className="fa-solid fa-layer-group text-xl" />
          </div>
        </div>

        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-center justify-between">
          <div>
             <p className="text-3xl font-black text-amber-600">{pending}</p>
             <p className="text-xs font-semibold text-amber-600/60 uppercase tracking-wider mt-1">Pending Action</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm border border-amber-100/50">
             <i className="fa-solid fa-clock-rotate-left text-xl" />
          </div>
        </div>

        <div className="bg-green-50 p-5 rounded-2xl border border-green-100 flex items-center justify-between">
           <div>
              <p className="text-3xl font-black text-green-600">{resolved}</p>
              <p className="text-xs font-semibold text-green-600/60 uppercase tracking-wider mt-1">Resolved Fixed</p>
           </div>
           <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-green-500 shadow-sm border border-green-100/50">
              <i className="fa-solid fa-check-double text-xl" />
           </div>
        </div>
      </div>

      {/* Action Nudges */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 text-center">
         <i className="fa-solid fa-hand-sparkles text-3xl text-amber-400 mb-4" />
         <h2 className="text-lg font-bold text-slate-800 mb-2">Need something fixed?</h2>
         <p className="text-sm text-slate-500 mb-6">Create a new request and trace it right back to resolution using your personalized app interface.</p>
         <Link 
            href="/dashboard/complaints/new" 
            className="w-full inline-flex items-center justify-center min-h-[48px] bg-[#0D1F3C] text-white rounded-xl font-bold shadow-md hover:bg-[#1a365d] transition-colors"
         >
           <i className="fa-solid fa-plus mr-2" /> Start New Complaint
         </Link>
      </div>

    </div>
  )
}