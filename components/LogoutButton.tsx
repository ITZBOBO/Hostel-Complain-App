'use client'

import { signOut } from 'next-auth/react'

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-6 rounded-xl min-h-[48px] transition-colors border border-red-100 shadow-sm mt-4"
    >
      <i className="fa-solid fa-power-off" />
      Sign Out Safely
    </button>
  )
}
