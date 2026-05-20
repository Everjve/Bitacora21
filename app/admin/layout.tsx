'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()
      if (user?.role !== 'admin') { router.replace('/app/diary'); return }
      setReady(true)
    })
  }, [router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-10 bg-[#FAFAFA]/95 backdrop-blur-sm border-b border-stone-100">
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <h1 className="font-serif text-xl text-stone-800">Bitácora 21</h1>
            </Link>
            <span className="font-sans text-xs text-stone-400 border border-stone-200 rounded px-2 py-0.5">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/app/diary"
              className="font-sans text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              Ir a la app
            </Link>
            <button
              onClick={handleSignOut}
              className="font-sans text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8">
        {children}
      </main>
    </div>
  )
}
