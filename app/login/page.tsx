'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !data.session) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.replace('/app/diary')
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <img src="/logo-negro.png" alt="Bitácora 21" className="h-8 w-auto mx-auto" />
          </Link>
          <div className="w-8 h-px bg-stone-300 mx-auto mt-4 mb-4" />
          <p className="font-sans text-sm text-stone-400">Continúa tu viaje</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-sans text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg font-sans text-sm text-stone-800 placeholder:text-stone-300 focus:border-stone-400 transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block font-sans text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Tu contraseña"
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg font-sans text-sm text-stone-800 placeholder:text-stone-300 focus:border-stone-400 transition-colors duration-200"
            />
          </div>

          {error && (
            <p className="font-sans text-sm text-red-500 text-center py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-stone-800 text-white text-sm font-sans font-medium tracking-wide rounded-lg hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Ingresando...
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <p className="text-center font-sans text-sm text-stone-400 mt-8">
          No tienes cuenta?{' '}
          <Link href="/register" className="text-stone-700 hover:text-stone-900 font-medium transition-colors">
            Regístrate
          </Link>
        </p>

        <div className="text-center mt-6 flex items-center justify-center gap-3 font-sans text-xs text-stone-400">
          <Link href="/privacy" className="hover:text-stone-600 transition-colors">Privacidad</Link>
          <span className="text-stone-300">&middot;</span>
          <Link href="/terms" className="hover:text-stone-600 transition-colors">Términos</Link>
        </div>
      </div>
    </main>
  )
}
