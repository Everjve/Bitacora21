'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User, DailyEntry } from '@/lib/supabase/types'

interface Stats {
  currentStreak: number
  longestStreak: number
  completedDays: number
  totalDays: number
  daysWithEmotions: number
  meditationDays: number
}

export default function EvolutionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!userData) return
      setUser(userData)

      const { data: entriesData } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('day_number', { ascending: true })

      const allEntries = entriesData || []
      setEntries(allEntries)

      const validEntries = allEntries.filter((e) => e.valid_day)
      const daysWithEmotions = allEntries.filter(
        (e) => e.emotions && e.emotions.length > 0
      ).length

      setStats({
        currentStreak: userData.current_streak,
        longestStreak: userData.longest_streak,
        completedDays: validEntries.length,
        totalDays: allEntries.length,
        daysWithEmotions,
        meditationDays: userData.meditation_days || 0,
      })

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    )
  }

  const programProgress = stats ? Math.round((stats.completedDays / 21) * 100) : 0

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl text-stone-800">
          {user?.name ? `Hola, ${user.name}` : 'Tu evolución'}
        </h2>
        {user?.start_date && (
          <p className="font-sans text-sm text-stone-400 mt-1">
            En camino desde{' '}
            {new Date(user.start_date + 'T12:00:00').toLocaleDateString('es', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
        {!user?.start_date && (
          <p className="font-sans text-sm text-stone-400 mt-1">
            Empieza a escribir para activar tu progreso
          </p>
        )}
      </div>

      {/* Progress ring area */}
      <div className="bg-white rounded-2xl p-6 border border-stone-100">
        <div className="flex items-center gap-6">
          {/* Circle progress */}
          <div className="relative shrink-0">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle
                cx="44"
                cy="44"
                r="36"
                fill="none"
                stroke="#f5f0eb"
                strokeWidth="6"
              />
              <circle
                cx="44"
                cy="44"
                r="36"
                fill="none"
                stroke="#44403c"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - programProgress / 100)}`}
                transform="rotate(-90 44 44)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-xl text-stone-700">{programProgress}%</span>
            </div>
          </div>

          <div>
            <p className="font-sans text-xs text-stone-400 uppercase tracking-wider mb-1">
              Progreso del programa
            </p>
            <p className="font-serif text-2xl text-stone-700">
              {stats?.completedDays || 0}
              <span className="font-sans text-sm text-stone-400 ml-1">/ 21 días</span>
            </p>
            <p className="font-sans text-xs text-stone-400 mt-1">
              {21 - (stats?.completedDays || 0)} días restantes
            </p>
          </div>
        </div>
      </div>

      {/* Streak stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-stone-100">
          <p className="font-sans text-xs text-stone-400 uppercase tracking-wider mb-2">
            Racha actual
          </p>
          <p className="font-serif text-3xl text-stone-700">{stats?.currentStreak || 0}</p>
          <p className="font-sans text-xs text-stone-400 mt-1">
            {stats?.currentStreak === 1 ? 'día' : 'días'} consecutivos
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-100">
          <p className="font-sans text-xs text-stone-400 uppercase tracking-wider mb-2">
            Racha máxima
          </p>
          <p className="font-serif text-3xl text-stone-700">{stats?.longestStreak || 0}</p>
          <p className="font-sans text-xs text-stone-400 mt-1">
            {stats?.longestStreak === 1 ? 'día' : 'días'} seguidos
          </p>
        </div>
      </div>

      {/* Additional stats */}
      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        {[
          {
            label: 'Días escritos',
            value: stats?.totalDays || 0,
            sub: 'entradas totales',
          },
          {
            label: 'Con emociones',
            value: stats?.daysWithEmotions || 0,
            sub: 'días con emociones registradas',
          },
          {
            label: 'Días de meditación',
            value: stats?.meditationDays || 0,
            sub: 'meditaciones completadas',
          },
          {
            label: 'Palabras promedio',
            value: entries.length > 0
              ? Math.round(
                  entries.reduce((sum, e) => {
                    const words = ((e.main_text || '') + ' ' + (e.insight_text || ''))
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean).length
                    return sum + words
                  }, 0) / entries.length
                )
              : 0,
            sub: 'palabras por entrada',
          },
        ].map((item, i, arr) => (
          <div
            key={item.label}
            className={`flex items-center justify-between px-4 py-3.5 ${
              i < arr.length - 1 ? 'border-b border-stone-100' : ''
            }`}
          >
            <div>
              <p className="font-sans text-sm text-stone-600">{item.label}</p>
              <p className="font-sans text-xs text-stone-300">{item.sub}</p>
            </div>
            <span className="font-serif text-2xl text-stone-700">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid (days 1-21) */}
      <div className="space-y-3">
        <p className="font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">
          Mapa del programa
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 21 }, (_, i) => i + 1).map((day) => {
            const entry = entries.find((e) => e.day_number === day)
            const isValid = entry?.valid_day
            const hasContent = !!entry
            return (
              <div
                key={day}
                className={`aspect-square rounded-lg flex items-center justify-center font-sans text-xs transition-all duration-200 ${
                  isValid
                    ? 'bg-stone-700 text-white'
                    : hasContent
                    ? 'bg-stone-200 text-stone-600'
                    : 'bg-stone-100 text-stone-300'
                }`}
              >
                {day}
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 pt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-stone-700" />
            <span className="font-sans text-xs text-stone-400">Completo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-stone-200" />
            <span className="font-sans text-xs text-stone-400">Iniciado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-stone-100" />
            <span className="font-sans text-xs text-stone-400">Pendiente</span>
          </div>
        </div>
      </div>
    </div>
  )
}
