'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { DailyEntry } from '@/lib/supabase/types'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function CollapsibleEntry({
  entry,
  type,
}: {
  entry: DailyEntry
  type: 'writing' | 'insight'
}) {
  const [expanded, setExpanded] = useState(false)
  const text = type === 'writing' ? entry.main_text! : entry.insight_text!

  const isWriting = type === 'writing'

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-shadow duration-200 hover:shadow-sm ${
        isWriting
          ? 'bg-white border-stone-200'
          : 'bg-amber-50 border-amber-200'
      }`}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 pt-4 pb-3 text-left"
      >
        <div className="flex items-center justify-between gap-3">
          <p className={`font-sans text-xs capitalize ${isWriting ? 'text-stone-400' : 'text-amber-500'}`}>
            {formatDate(entry.entry_date)}
          </p>
          <svg
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
              isWriting ? 'text-stone-300' : 'text-amber-400'
            } ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Preview collapsed — max 5 lines */}
        {!expanded && (
          <p className={`font-sans text-sm leading-relaxed mt-2 line-clamp-5 ${
            isWriting ? 'text-stone-600' : 'text-amber-800 italic'
          }`}>
            {text}
          </p>
        )}
      </button>

      {expanded && (
        <div className={`px-5 pb-5 border-t ${isWriting ? 'border-stone-100' : 'border-amber-100'}`}>
          <p className={`font-sans text-sm leading-relaxed whitespace-pre-wrap pt-4 ${
            isWriting ? 'text-stone-600' : 'text-amber-800 italic'
          }`}>
            {text}
          </p>
        </div>
      )}
    </div>
  )
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadEntries = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('entry_date', { ascending: false })

    if (data) setEntries(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    )
  }

  const withWriting = entries.filter((e) => e.main_text)
  const withInsight = entries.filter((e) => e.insight_text)
  const hasAny = withWriting.length > 0 || withInsight.length > 0

  if (!hasAny) {
    return (
      <div className="px-5 py-16 text-center space-y-3">
        <p className="font-serif text-2xl text-stone-600">Aún no hay escritos</p>
        <p className="font-sans text-sm text-stone-400">Cuando guardes tu primer diario aparecerá aquí.</p>
      </div>
    )
  }

  return (
    <div className="px-5 py-6 space-y-8">
      <div className="text-center">
        <span className="font-sans text-xs text-stone-400 uppercase tracking-widest">Tu bitácora</span>
        <h2 className="font-serif text-3xl text-stone-700 mt-1">Mis escritos</h2>
      </div>

      {/* Tus escritos */}
      {withWriting.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="font-sans text-xs text-stone-500 uppercase tracking-widest font-medium">Tus escritos</span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>
          {withWriting.map((entry) => (
            <CollapsibleEntry key={`writing-${entry.id}`} entry={entry} type="writing" />
          ))}
        </section>
      )}

      {/* Insights del día */}
      {withInsight.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-amber-200" />
            <span className="font-sans text-xs text-amber-600 uppercase tracking-widest font-medium">Insights del día</span>
            <div className="h-px flex-1 bg-amber-200" />
          </div>
          {withInsight.map((entry) => (
            <CollapsibleEntry key={`insight-${entry.id}`} entry={entry} type="insight" />
          ))}
        </section>
      )}
    </div>
  )
}
