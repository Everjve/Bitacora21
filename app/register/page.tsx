'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        setError('Este correo ya está registrado')
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    if (!authData.user) {
      setError('Error al crear usuario')
      setLoading(false)
      return
    }

    // Wait for any DB trigger to create the profile
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // If profile doesn't exist yet, create it
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle()

    if (!profile) {
      await supabase.from('users').insert({
        id: authData.user.id,
        email,
        name,
        created_at: new Date().toISOString(),
      })
    }

    router.push('/app/diary')
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-3xl text-stone-800">Bitácora 21</h1>
          </Link>
          <div className="w-8 h-px bg-stone-300 mx-auto mt-4 mb-4" />
          <p className="font-sans text-sm text-stone-400">Comienza tu transformación</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-sans text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
              Tu nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Como prefieres llamarte"
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg font-sans text-sm text-stone-800 placeholder:text-stone-300 focus:border-stone-400 transition-colors duration-200"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
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
                Creando cuenta...
              </span>
            ) : 'Crear cuenta'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center font-sans text-sm text-stone-400 mt-8">
          Ya tienes cuenta?{' '}
          <Link href="/login" className="text-stone-700 hover:text-stone-900 font-medium transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
