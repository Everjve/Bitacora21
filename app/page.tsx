'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/app/diary')
      else setChecking(false)
    })
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center app-container mx-auto">
        {/* Logo mark */}
        <div className="mb-8">
          <div className="w-16 h-px bg-stone-300 mx-auto mb-6" />
          <span className="text-xs font-sans font-medium tracking-[0.25em] text-stone-400 uppercase">
            Diario interior
          </span>
        </div>

        <h1 className="mb-4">
          <img src="/logo-negro.png" alt="Bitácora 21" className="h-12 w-auto mx-auto" />
        </h1>

        <div className="w-8 h-px bg-stone-300 mx-auto my-6" />

        <p className="font-sans text-base text-stone-500 leading-relaxed max-w-xs mb-2">
          Un viaje de 21 días para redescubrir tu deseo más profundo.
        </p>
        <p className="font-sans text-sm text-stone-400 leading-relaxed max-w-xs mb-12">
          Escritura consciente. Claridad interior. Transformación genuina.
        </p>

        {/* CTA Buttons */}
        <div className="w-full max-w-xs space-y-3">
          <Link
            href="/register"
            className="block w-full py-3.5 bg-stone-800 text-white text-sm font-sans font-medium tracking-wide text-center rounded-lg hover:bg-stone-900 transition-colors duration-200"
          >
            Comenzar el viaje
          </Link>
          <Link
            href="/login"
            className="block w-full py-3.5 border border-stone-300 text-stone-700 text-sm font-sans font-medium tracking-wide text-center rounded-lg hover:bg-stone-50 transition-colors duration-200"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="app-container mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { number: '21', label: 'Días de práctica' },
            { number: '12', label: 'Emociones a explorar' },
            { number: '5', label: 'Etapas de transformación' },
          ].map((item) => (
            <div key={item.label} className="py-4">
              <div className="font-serif text-2xl text-stone-700 mb-1">{item.number}</div>
              <div className="font-sans text-xs text-stone-400 leading-tight">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center pb-8">
        <p className="font-sans text-xs text-stone-300">
          Un espacio seguro para tu exploración interior
        </p>
      </footer>
    </main>
  )
}
