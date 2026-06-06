'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [userName, setUserName] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
        return
      }

      supabase
        .from('users')
        .select('name, role')
        .eq('id', session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.name) setUserName(data.name)
          if (data?.role === 'admin') setIsAdmin(true)
        })

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

  const navItems = [
    { href: '/app/diary', label: 'Diario' },
    { href: '/app/entries', label: 'Escritos' },
    { href: '/app/emotions', label: 'Emociones' },
    { href: '/app/evolution', label: 'Evolución' },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <header className="sticky top-0 z-10 bg-[#FAFAFA]/95 backdrop-blur-sm border-b border-stone-100">
        <div className="app-container mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/app/diary">
            <img src="/logo-negro.png" alt="Bitácora 21" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            {userName && (
              <span className="font-sans text-xs text-stone-400">{userName}</span>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="font-sans text-xs text-stone-400 hover:text-stone-600 transition-colors border border-stone-200 rounded px-2 py-0.5"
              >
                Admin
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="font-sans text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 app-container mx-auto w-full pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-stone-100 safe-bottom">
        <div className="app-container mx-auto px-2">
          <div className="flex items-center">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-1 py-3 text-center font-sans text-xs font-medium transition-colors duration-200 ${
                    active ? 'text-stone-800' : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {active && (
                    <div className="w-1 h-1 bg-stone-800 rounded-full mx-auto mb-1" />
                  )}
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
