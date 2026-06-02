'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { DailyContent } from '@/lib/supabase/types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Metrics {
  totalUsers: number
  activeToday: number
  activeWeek: number
  pctDay1: number
  pctDay7: number
  pctDay21: number
  avgStreak: number
}

interface AbandonRow {
  label: string
  reached: number
  abandoned: number
  pct: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-stone-100 rounded-xl px-5 py-4 space-y-1">
      <p className="font-sans text-xs text-stone-400 uppercase tracking-wider">{label}</p>
      <p className="font-serif text-3xl text-stone-700">{value}</p>
    </div>
  )
}

// ─── Tab: Metrics ─────────────────────────────────────────────────────────────

function MetricsTab() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0]
      const last7 = new Date()
      last7.setDate(last7.getDate() - 7)
      const last7Str = last7.toISOString().split('T')[0]

      const [
        { count: totalUsers },
        { count: activeToday },
        { count: activeWeek },
        { data: day1Users },
        { data: day7Users },
        { data: day21Users },
        { data: streaks },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('daily_entries').select('user_id', { count: 'exact', head: true }).eq('entry_date', today).eq('valid_day', true),
        supabase.from('daily_entries').select('user_id', { count: 'exact', head: true }).gte('entry_date', last7Str).eq('valid_day', true),
        supabase.from('daily_entries').select('user_id').eq('day_number', 1).eq('valid_day', true),
        supabase.from('daily_entries').select('user_id').eq('day_number', 7).eq('valid_day', true),
        supabase.from('daily_entries').select('user_id').eq('day_number', 21).eq('valid_day', true),
        supabase.from('users').select('current_streak'),
      ])

      const total = totalUsers || 0
      const avgStreak = streaks?.length
        ? streaks.reduce((a, b) => a + (b.current_streak || 0), 0) / streaks.length
        : 0

      setMetrics({
        totalUsers: total,
        activeToday: activeToday || 0,
        activeWeek: activeWeek || 0,
        pctDay1: total ? ((day1Users?.length || 0) / total) * 100 : 0,
        pctDay7: total ? ((day7Users?.length || 0) / total) * 100 : 0,
        pctDay21: total ? ((day21Users?.length || 0) / total) * 100 : 0,
        avgStreak,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  if (!metrics) return null

  return (
    <div className="space-y-6">
      <div>
        <p className="font-sans text-xs text-stone-400 uppercase tracking-widest mb-3">Usuarios</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Total usuarios" value={metrics.totalUsers} />
          <StatCard label="Activos hoy" value={metrics.activeToday} />
          <StatCard label="Activos 7 días" value={metrics.activeWeek} />
        </div>
      </div>

      <div>
        <p className="font-sans text-xs text-stone-400 uppercase tracking-widest mb-3">Retención</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="% Completó Día 1" value={`${metrics.pctDay1.toFixed(1)}%`} />
          <StatCard label="% Completó Día 7" value={`${metrics.pctDay7.toFixed(1)}%`} />
          <StatCard label="% Completó Día 21" value={`${metrics.pctDay21.toFixed(1)}%`} />
        </div>
      </div>

      <div>
        <p className="font-sans text-xs text-stone-400 uppercase tracking-widest mb-3">Engagement</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Racha promedio" value={`${metrics.avgStreak.toFixed(1)} días`} />
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Abandonment ────────────────────────────────────────────────────────

function AbandonmentTab() {
  const [rows, setRows] = useState<AbandonRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const days = [1, 3, 4, 7, 8, 14, 15, 21]
      const results = await Promise.all(
        days.map((d) =>
          supabase
            .from('daily_entries')
            .select('user_id')
            .eq('day_number', d)
            .eq('valid_day', true)
        )
      )

      const [d1, d3, d4, d7, d8, d14, d15, d21] = results.map((r) =>
        (r.data || []).map((x: { user_id: string }) => x.user_id)
      )

      function buildRow(label: string, startUsers: string[], endUsers: string[]): AbandonRow {
        const endSet = new Set(endUsers)
        const abandoned = startUsers.filter((u) => !endSet.has(u)).length
        return {
          label,
          reached: startUsers.length,
          abandoned,
          pct: startUsers.length ? (abandoned / startUsers.length) * 100 : 0,
        }
      }

      setRows([
        buildRow('Días 1–3', d1, d3),
        buildRow('Días 4–7', d4, d7),
        buildRow('Días 8–14', d8, d14),
        buildRow('Días 15–21', d15, d21),
      ])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <p className="font-sans text-xs text-stone-400">
        Muestra cuántos usuarios llegaron a cada tramo pero no lo completaron.
      </p>
      <div className="bg-white border border-stone-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="px-5 py-3 text-left font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">Tramo</th>
              <th className="px-5 py-3 text-right font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">Llegaron</th>
              <th className="px-5 py-3 text-right font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">Abandonaron</th>
              <th className="px-5 py-3 text-right font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">% Abandono</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i < rows.length - 1 ? 'border-b border-stone-50' : ''}>
                <td className="px-5 py-4 font-sans text-sm text-stone-700">{row.label}</td>
                <td className="px-5 py-4 text-right font-sans text-sm text-stone-500">{row.reached}</td>
                <td className="px-5 py-4 text-right font-sans text-sm text-stone-500">{row.abandoned}</td>
                <td className="px-5 py-4 text-right font-sans text-sm font-medium">
                  <span className={row.pct > 50 ? 'text-red-500' : row.pct > 25 ? 'text-amber-500' : 'text-emerald-600'}>
                    {row.pct.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab: Content Editor ─────────────────────────────────────────────────────

function ContentTab() {
  const [dayNumber, setDayNumber] = useState(0)
  const [content, setContent] = useState<Partial<DailyContent> | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const loadContent = useCallback(async (day: number) => {
    setLoading(true)
    setStatus('idle')
    const { data } = await supabase
      .from('daily_content')
      .select('*')
      .eq('day_number', day)
      .maybeSingle()
    setContent(data ?? { day_number: day, video_embed_url: '', daily_quote: '', questions_text: '', insight_prompt_text: '' })
    setLoading(false)
  }, [])

  useEffect(() => {
    loadContent(0)
  }, [loadContent])

  async function handleSave() {
    if (!content) return
    setSaving(true)
    setStatus('idle')

    const { error } = await supabase
      .from('daily_content')
      .update({
        video_embed_url: content.video_embed_url,
        daily_quote: content.daily_quote,
        questions_text: content.questions_text,
        insight_prompt_text: content.insight_prompt_text,
      })
      .eq('day_number', dayNumber)

    setStatus(error ? 'error' : 'success')
    setSaving(false)
    if (!error) setTimeout(() => setStatus('idle'), 3000)
  }

  function field(key: keyof DailyContent, value: string) {
    setContent((prev) => prev ? { ...prev, [key]: value } : prev)
  }

  const days = Array.from({ length: 23 }, (_, i) => i)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <label className="font-sans text-xs font-medium text-stone-500 uppercase tracking-wider whitespace-nowrap">Día</label>
        <select
          value={dayNumber}
          onChange={(e) => {
            const d = Number(e.target.value)
            setDayNumber(d)
            loadContent(d)
          }}
          className="px-3 py-2 bg-white border border-stone-200 rounded-lg font-sans text-sm text-stone-700 focus:border-stone-400 transition-colors"
        >
          {days.map((d) => (
            <option key={d} value={d}>
              {d === 0 ? 'Día 0 — Bienvenida' : `Día ${d}`}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : content ? (
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">
              Video embed URL
            </label>
            <textarea
              value={content.video_embed_url || ''}
              onChange={(e) => field('video_embed_url', e.target.value)}
              rows={3}
              placeholder='<iframe src="https://www.youtube.com/embed/..." ...></iframe>'
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl font-mono text-xs text-stone-700 placeholder:text-stone-300 focus:border-stone-400 resize-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">
              Cita del día
            </label>
            <input
              type="text"
              value={content.daily_quote || ''}
              onChange={(e) => field('daily_quote', e.target.value)}
              placeholder="Una frase inspiradora..."
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl font-sans text-sm text-stone-700 placeholder:text-stone-300 focus:border-stone-400 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">
              Preguntas para reflexionar
            </label>
            <textarea
              value={content.questions_text || ''}
              onChange={(e) => field('questions_text', e.target.value)}
              rows={5}
              placeholder="1. Primera pregunta&#10;2. Segunda pregunta..."
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl font-sans text-sm text-stone-700 placeholder:text-stone-300 focus:border-stone-400 resize-none leading-relaxed transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">
              Prompt de insight
            </label>
            <textarea
              value={content.insight_prompt_text || ''}
              onChange={(e) => field('insight_prompt_text', e.target.value)}
              rows={3}
              placeholder="Guía para el insight del día..."
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl font-sans text-sm text-stone-700 placeholder:text-stone-300 focus:border-stone-400 resize-none leading-relaxed transition-colors"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-stone-800 text-white rounded-xl font-sans text-sm font-medium hover:bg-stone-900 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {status === 'success' && (
              <p className="font-sans text-sm text-emerald-600">Guardado correctamente</p>
            )}
            {status === 'error' && (
              <p className="font-sans text-sm text-red-500">Error al guardar. Intenta de nuevo.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'metrics', label: 'Métricas' },
  { id: 'abandonment', label: 'Abandono' },
  { id: 'content', label: 'Contenido' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function AdminPage() {
  const [tab, setTab] = useState<TabId>('metrics')

  return (
    <div className="space-y-8">
      <div>
        <span className="font-sans text-xs text-stone-400 uppercase tracking-widest">Panel de control</span>
        <h2 className="font-serif text-3xl text-stone-700 mt-1">Dashboard</h2>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-lg font-sans text-sm font-medium transition-all duration-200 ${
              tab === t.id
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'metrics' && <MetricsTab />}
        {tab === 'abandonment' && <AbandonmentTab />}
        {tab === 'content' && <ContentTab />}
      </div>
    </div>
  )
}
