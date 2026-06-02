'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { EMOTIONS } from '@/lib/supabase/types'
import type { DailyEntry } from '@/lib/supabase/types'

interface EntryWithEmotions {
  day_number: number
  entry_date: string
  emotions: string[]
  valid_day: boolean
}

export default function EmotionsPage() {
  const [entries, setEntries] = useState<EntryWithEmotions[]>([])
  const [loading, setLoading] = useState(true)
  const [emotionCounts, setEmotionCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from('daily_entries')
        .select('day_number, entry_date, emotions, valid_day')
        .eq('user_id', session.user.id)
        .order('day_number', { ascending: true })

      if (data) {
        const filtered = data.filter((e) => e.emotions && e.emotions.length > 0)
        setEntries(filtered)

        const counts: Record<string, number> = {}
        filtered.forEach((entry) => {
          entry.emotions.forEach((emotion: string) => {
            counts[emotion] = (counts[emotion] || 0) + 1
          })
        })
        setEmotionCounts(counts)
      }

      setLoading(false)
    }
    load()
  }, [])

  function getEmotionColor(name: string): string {
    return EMOTIONS.find((e) => e.name === name)?.color || '#9CA3AF'
  }

  const sortedEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <div className="w-12 h-px bg-stone-200 mx-auto mb-6" />
        <p className="font-serif text-xl text-stone-400 mb-2">Sin registros aún</p>
        <p className="font-sans text-sm text-stone-300">
          Tus emociones aparecerán aquí conforme escribas en tu diario.
        </p>
      </div>
    )
  }

  return (
    <div className="px-5 py-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl text-stone-800">Mapa emocional</h2>
        <p className="font-sans text-sm text-stone-400 mt-1">
          {entries.length} {entries.length === 1 ? 'día registrado' : 'días registrados'}
        </p>
      </div>

      {/* Top emotions */}
      {sortedEmotions.length > 0 && (
        <div className="space-y-3">
          <p className="font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">
            Emociones más frecuentes
          </p>
          <div className="space-y-2">
            {sortedEmotions.map(([name, count]) => {
              const color = getEmotionColor(name)
              const maxCount = sortedEmotions[0][1]
              const pct = (count / maxCount) * 100
              return (
                <div key={name} className="flex items-center gap-3">
                  <span className="font-sans text-xs text-stone-600 w-24 shrink-0">{name}</span>
                  <div className="flex-1 bg-stone-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="font-sans text-xs text-stone-400 w-6 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-3">
        <p className="font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">
          Por día
        </p>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.day_number} className="bg-white rounded-xl p-4 border border-stone-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-sm text-stone-600">Día {entry.day_number}</span>
                  {entry.valid_day && (
                    <span className="font-sans text-xs text-stone-300 bg-stone-50 px-2 py-0.5 rounded-full">
                      Completo
                    </span>
                  )}
                </div>
                <span className="font-sans text-xs text-stone-300">
                  {new Date(entry.entry_date + 'T12:00:00').toLocaleDateString('es', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entry.emotions.map((emotion) => {
                  const color = getEmotionColor(emotion)
                  return (
                    <span
                      key={emotion}
                      className="font-sans text-xs px-2.5 py-1 rounded-full text-white"
                      style={{ backgroundColor: color }}
                    >
                      {emotion}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
