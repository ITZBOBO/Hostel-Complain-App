import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { LogoutButton } from '@/components/LogoutButton'

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const sessionUser = session.user as any
  const user = await db.user.findFirst({
    where: sessionUser.id ? { id: sessionUser.id } : { email: sessionUser.email },
  })

  if (!user) redirect('/login')

  return (
    <div className="w-full max-w-xl mx-auto mt-4 px-2">
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200/60 p-6 flex flex-col items-center relative overflow-hidden">
        
        {/* Subtle Gradient Header inside Card */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#0D1F3C] to-[#1e3a8a] opacity-95"></div>

        {/* Profile Avatar */}
        <div className="relative mt-12 mb-5 z-10 w-32 h-32 rounded-full border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center overflow-hidden">
            {user.photo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <i className="fa-solid fa-user text-5xl text-slate-400" />
            )}
        </div>

        {/* Name & Badge */}
        <h2 className="font-bold text-[#0D1F3C] text-2xl text-center leading-tight mb-2">{user.name}</h2>
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-8 shadow-sm">
          <i className="fa-solid fa-circle-check" /> Active RUN Student
        </span>

        {/* Structured Details */}
        <div className="w-full space-y-4 mb-4">
          <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100/50">
            
            <div className="flex flex-col gap-1.5 mb-5">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Matriculation No.</span>
              <span className="text-base font-semibold text-slate-800 font-mono bg-white px-3 py-1.5 rounded-xl border border-slate-200 inline-block w-fit shadow-sm">
                {user.matricNo}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 mb-5">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Department</span>
              <span className="text-base font-semibold text-slate-700 leading-snug">
                {user.department || '—'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 mb-5">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Programme</span>
              <span className="text-base font-semibold text-slate-700 leading-snug">
                {user.programme || '—'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Academic Level</span>
              <span className="text-base font-bold text-[#0D1F3C] flex items-center gap-2">
                <i className="fa-solid fa-graduation-cap text-[#0D1F3C]/50" />
                {user.level || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Zone */}
        <div className="w-full">
           <LogoutButton />
        </div>
      </div>
    </div>
  )
}
