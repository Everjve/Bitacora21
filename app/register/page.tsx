'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [acceptedLegal, setAcceptedLegal] = useState(false)
  const [registered, setRegistered] = useState(false)

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
      options: {
        data: { name },
        emailRedirectTo: 'https://bitacora21.com/app/diary',
      },
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

    // Create profile immediately with timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('id', authData.user.id)
      .maybeSingle()

    if (!profile) {
      await supabase.from('users').insert({
        id: authData.user.id,
        email,
        name,
        timezone,
        created_at: new Date().toISOString(),
      })
    }

    setLoading(false)
    setRegistered(true)
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <img src="/logo-negro.png" alt="Bitácora 21" className="h-8 w-auto mx-auto" />
          </Link>
          <div className="w-8 h-px bg-stone-300 mx-auto mt-4 mb-4" />
          <p className="font-sans text-sm text-stone-400">
            {registered ? 'Revisa tu correo' : 'Comienza tu transformación'}
          </p>
        </div>

        {registered ? (
          <div className="text-center space-y-5">
            <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-600">
                <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                <path d="m16 19 2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="font-serif text-xl text-stone-800 mb-2">Correo enviado</p>
              <p className="font-sans text-sm text-stone-500 leading-relaxed">
                Te hemos enviado un correo de confirmación a <span className="font-medium text-stone-700">{email}</span>. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
              </p>
              <p className="font-sans text-xs text-stone-400 mt-3">
                Una vez confirmado, podrás iniciar sesión.
              </p>
            </div>
            <div className="w-8 h-px bg-stone-200 mx-auto" />
            <Link
              href="/login"
              className="inline-block font-sans text-sm text-stone-600 hover:text-stone-900 font-medium transition-colors"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
          <>
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

              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="legal-accept"
                  checked={acceptedLegal}
                  onChange={(e) => setAcceptedLegal(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-800 focus:ring-stone-400 cursor-pointer accent-stone-800"
                />
                <label htmlFor="legal-accept" className="font-sans text-xs text-stone-500 leading-relaxed cursor-pointer">
                  Acepto el{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-stone-600 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-500 transition-colors"
                  >
                    Aviso de Privacidad
                  </Link>{' '}
                  y los{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-stone-600 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-500 transition-colors"
                  >
                    Términos y Condiciones
                  </Link>{' '}
                  del prototipo.
                </label>
              </div>

              {error && (
                <p className="font-sans text-sm text-red-500 text-center py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !acceptedLegal}
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
          </>
        )}
      </div>
    </main>
  )
}
