'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { EMOTIONS } from '@/lib/supabase/types'
import type { DailyContent, DailyEntry, User } from '@/lib/supabase/types'

function extractYouTubeId(embedHtml: string): string | null {
  const match = embedHtml.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

function getTodayInUserTimezone(timezone: string): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: timezone })
}

function isBeforeDeadline(timezone: string): boolean {
  const now = new Date()
  const todayEnd = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  todayEnd.setHours(23, 59, 59, 999)
  return now <= todayEnd
}

export default function DiaryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [content, setContent] = useState<DailyContent | null>(null)
  const [entry, setEntry] = useState<DailyEntry | null>(null)
  const [mainText, setMainText] = useState('')
  const [insightText, setInsightText] = useState('')
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [dayNumber, setDayNumber] = useState(1)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [emotionsLocked, setEmotionsLocked] = useState(false)
  const [meditated, setMeditated] = useState(false)
  const [savingMeditation, setSavingMeditation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dayOpen, setDayOpen] = useState(true)

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()

    if (!userData) return

    setUser(userData)

    const tz = userData.timezone || 'America/Bogota'
    const beforeDeadline = isBeforeDeadline(tz)
    setDayOpen(beforeDeadline)

    // Get the highest day_number with valid_day = true
    const { data: completedEntries } = await supabase
      .from('daily_entries')
      .select('day_number')
      .eq('user_id', session.user.id)
      .eq('valid_day', true)
      .order('day_number', { ascending: false })
      .limit(1)

    const maxCompletedDay = completedEntries?.[0]?.day_number || 0

    // The "next day to work on" is maxCompletedDay + 1
    // But we only allow advancing past that if:
    //   - Midnight has passed (beforeDeadline === false means past deadline)
    //   - AND the current day (maxCompletedDay) is valid
    // If before deadline, user stays on their current day (can keep writing)
    // If past deadline and current day is valid, advance to next day
    // If past deadline but current day is NOT valid, stay on same day (incomplete)
    let day: number
    if (maxCompletedDay === 0) {
      // Never completed a day → always start at day 1
      day = 1
    } else if (beforeDeadline) {
      // Day still open → stay on the day after the last completed one
      // (user can keep writing today)
      day = Math.min(maxCompletedDay + 1, 21)
    } else {
      // Past deadline → advance is allowed since last completed day is valid
      // Move to the next day
      day = Math.min(maxCompletedDay + 1, 21)
    }

    setDayNumber(day)

    const { data: contentData } = await supabase
      .from('daily_content')
      .select('*')
      .eq('day_number', day)
      .maybeSingle()

    setContent(contentData)

    const { data: entryData } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('day_number', day)
      .maybeSingle()

    setEntry(entryData ?? null)
    setMainText('')
    setInsightText('')
    setSelectedEmotions(entryData?.emotions || [])
    setMeditated(entryData?.meditated ?? false)
    if (entryData) setEmotionsLocked(true)

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function toggleEmotion(emotion: string) {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    )
  }

  async function handleMeditated() {
    if (meditated || savingMeditation) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !user) return

    setSavingMeditation(true)
    const tz = user.timezone || 'America/Bogota'
    const today = getTodayInUserTimezone(tz)

    if (entry) {
      await supabase
        .from('daily_entries')
        .update({ meditated: true })
        .eq('id', entry.id)
      setEntry({ ...entry, meditated: true })
    } else {
      const { data: newEntry } = await supabase
        .from('daily_entries')
        .insert({
          user_id: session.user.id,
          day_number: dayNumber,
          entry_date: today,
          main_text: '',
          insight_text: '',
          emotions: [],
          valid_day: false,
          meditated: true,
        })
        .select()
        .maybeSingle()
      if (newEntry) setEntry(newEntry)

      if (!user.start_date) {
        await supabase.from('users').update({ start_date: today }).eq('id', session.user.id)
        setUser({ ...user, start_date: today })
      }
    }

    const newMeditationDays = (user.meditation_days || 0) + 1
    await supabase
      .from('users')
      .update({ meditation_days: newMeditationDays })
      .eq('id', session.user.id)
    setUser((u) => u ? { ...u, meditation_days: newMeditationDays } : u)

    setMeditated(true)
    setSavingMeditation(false)
  }

  async function handleSave() {
    console.log('[diary] handleSave iniciado — usuario:', user?.id, 'día:', dayNumber)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !user) {
      console.error('[diary] Sin sesión o usuario')
      return
    }
    if (!mainText.trim() && !insightText.trim()) {
      console.warn('[diary] Texto vacío, no se guarda')
      return
    }

    setSaving(true)

    try {
      const tz = user.timezone || 'America/Bogota'
      const today = getTodayInUserTimezone(tz)

      // Fetch existing entry to append text
      const { data: currentEntry, error: fetchError } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('day_number', dayNumber)
        .maybeSingle()

      if (fetchError) console.error('[diary] Error al leer entry existente:', fetchError)

      const separator = '\n\n---\n\n'
      const newMain = currentEntry?.main_text
        ? (mainText.trim() ? currentEntry.main_text + separator + mainText.trim() : currentEntry.main_text)
        : mainText.trim()
      const newInsight = currentEntry?.insight_text
        ? (insightText.trim() ? currentEntry.insight_text + separator + insightText.trim() : currentEntry.insight_text)
        : insightText.trim()

      const isValid = (newMain + newInsight).length >= 5
      console.log('[diary] newMain.length:', newMain.length, '| isValid:', isValid)

      const { data: upsertData, error: upsertError } = await supabase
        .from('daily_entries')
        .upsert(
          {
            user_id: session.user.id,
            day_number: dayNumber,
            entry_date: today,
            main_text: newMain,
            insight_text: newInsight,
            emotions: currentEntry ? currentEntry.emotions : selectedEmotions,
            valid_day: isValid,
            meditated: currentEntry ? currentEntry.meditated : meditated,
          },
          { onConflict: 'user_id,day_number' }
        )
        .select()
        .maybeSingle()

      if (upsertError) {
        console.error('[diary] Error de upsert:', upsertError)
        setSaving(false)
        return
      }

      console.log('[diary] Upsert exitoso:', upsertData)
      if (upsertData) setEntry(upsertData)

      // Set start_date on first valid save
      if (isValid && !user.start_date) {
        const { error: startDateError } = await supabase
          .from('users')
          .update({ start_date: today })
          .eq('id', session.user.id)
        if (startDateError) {
          console.error('[diary] Error al actualizar start_date:', startDateError)
        } else {
          console.log('[diary] start_date actualizado:', today)
          setUser({ ...user, start_date: today })
        }
      }

      // Update streaks
      if (isValid) {
        const { data: allEntries } = await supabase
          .from('daily_entries')
          .select('day_number, valid_day')
          .eq('user_id', session.user.id)
          .eq('valid_day', true)

        const validCount = allEntries?.length || 0
        const newLongest = Math.max(validCount, user.longest_streak)

        await supabase
          .from('users')
          .update({ current_streak: validCount, longest_streak: newLongest })
          .eq('id', session.user.id)

        console.log('[diary] Racha actualizada — válidos:', validCount)
      }

      setMainText('')
      setInsightText('')
      setEmotionsLocked(true)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('[diary] Error inesperado en handleSave:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    )
  }

  const tz = user?.timezone || 'America/Bogota'
  const beforeDeadline = isBeforeDeadline(tz)

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Day header */}
      <div className="text-center">
        <span className="font-sans text-xs text-stone-400 uppercase tracking-widest">
          {content?.stage_name || 'Tu diario'}
        </span>
        <div className="flex items-center justify-center gap-3 mt-2">
          <div className="h-px flex-1 bg-stone-200" />
          <span className="font-serif text-4xl text-stone-700">
            Día {dayNumber}
          </span>
          <div className="h-px flex-1 bg-stone-200" />
        </div>
        <p className="font-sans text-xs text-stone-400 mt-1">de 21</p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-stone-100 rounded-full h-1">
        <div
          className="bg-stone-600 h-1 rounded-full transition-all duration-500"
          style={{ width: `${(dayNumber / 21) * 100}%` }}
        />
      </div>

      {/* Deadline notice */}
      {!beforeDeadline && entry?.valid_day && (
        <div className="bg-stone-100 rounded-xl p-4 text-center">
          <p className="font-sans text-sm text-stone-500">
            El día de hoy ya ha finalizado en tu zona horaria ({tz.replace('_', ' ')}).
          </p>
          <p className="font-sans text-xs text-stone-400 mt-1">
            Tu día fue completado. Mañana continuarás con el siguiente.
          </p>
        </div>
      )}
      {!beforeDeadline && !entry?.valid_day && (
        <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
          <p className="font-sans text-sm text-amber-700">
            El día ya finalizó en tu zona horaria ({tz.replace('_', ' ')}) pero aún no completaste este día.
          </p>
          <p className="font-sans text-xs text-amber-600 mt-1">
            Escribe al menos 5 caracteres para que el día cuente en tu racha.
          </p>
        </div>
      )}

      {/* Daily quote */}
      {content?.daily_quote && (
        <div className="bg-white rounded-xl p-5 border border-stone-100">
          <p className="font-serif text-base text-stone-600 italic leading-relaxed text-center">
            &ldquo;{content.daily_quote}&rdquo;
          </p>
        </div>
      )}

      {/* Video section */}
      {content?.video_embed_url && (() => {
        const videoId = extractYouTubeId(content.video_embed_url)
        if (!videoId) return null
        const src = `https://www.youtube.com/embed/${videoId}`
        return (
          <div className="rounded-xl overflow-hidden bg-stone-100">
            <div className="relative w-full" style={{ paddingBottom: '177.78%' }}>
              <iframe
                src={src}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                title={`Video día ${dayNumber}`}
              />
            </div>
          </div>
        )
      })()}

      {/* Questions */}
      {content?.questions_text && (
        <div className="space-y-1">
          <p className="font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">
            Preguntas para reflexionar
          </p>
          <p className="font-sans text-sm text-stone-500 leading-relaxed bg-stone-50 rounded-lg p-4">
            {content.questions_text}
          </p>
        </div>
      )}

      {/* Main text area */}
      <div className="space-y-2">
        <label className="font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">
          Tu escritura
        </label>
        <textarea
          value={mainText}
          onChange={(e) => setMainText(e.target.value)}
          placeholder="Escribe libremente lo que sientes, piensas y observas hoy..."
          rows={7}
          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl font-sans text-sm text-stone-700 placeholder:text-stone-300 focus:border-stone-400 resize-none leading-relaxed transition-colors duration-200"
        />
      </div>

      {/* Emotions */}
      <div className="space-y-3">
        <p className="font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">
          Emociones de hoy
        </p>
        <div className="grid grid-cols-3 gap-2">
          {EMOTIONS.map((emotion) => {
            const selected = selectedEmotions.includes(emotion.name)
            return (
              <button
                key={emotion.name}
                onClick={() => !emotionsLocked && toggleEmotion(emotion.name)}
                disabled={emotionsLocked}
                className={`py-2.5 px-3 rounded-lg font-sans text-xs font-medium transition-all duration-200 ${
                  selected
                    ? 'text-white shadow-sm'
                    : emotionsLocked
                    ? 'text-stone-400 bg-stone-50 border border-stone-100 cursor-default'
                    : 'text-stone-600 bg-white border border-stone-200 hover:border-stone-300'
                }`}
                style={selected ? { backgroundColor: emotion.color } : {}}
              >
                {emotion.name}
              </button>
            )
          })}
        </div>
        {emotionsLocked && (
          <p className="font-sans text-xs text-stone-300 italic">Las emociones se registran una sola vez por día.</p>
        )}
      </div>

      {/* Meditation section */}
      {content?.meditation_embed_url && (
        <div className="space-y-3">
          <p className="font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">
            Meditación de la etapa
          </p>
          <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
            <iframe
              width="100%"
              height="166"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src={`https://w.soundcloud.com/player/?url=${content.meditation_embed_url}&color=%23786455&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
              title={`Meditación día ${dayNumber}`}
            />
          </div>
          <button
            onClick={handleMeditated}
            disabled={meditated || savingMeditation}
            className={`w-full py-3 rounded-xl font-sans text-sm font-medium tracking-wide transition-all duration-300 border ${
              meditated
                ? 'bg-stone-50 border-stone-200 text-stone-400 cursor-default'
                : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-50 hover:border-stone-400'
            }`}
          >
            {savingMeditation ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                Registrando...
              </span>
            ) : meditated ? (
              'Meditación completada hoy'
            ) : (
              'Marcar meditación como completada'
            )}
          </button>
        </div>
      )}

      {/* Insight section */}
      {content?.insight_prompt_text && (
        <div className="space-y-2">
          <label className="font-sans text-xs font-medium text-stone-400 uppercase tracking-wider">
            Insight del día
          </label>
          <p className="font-sans text-xs text-stone-400 italic">{content.insight_prompt_text}</p>
          <textarea
            value={insightText}
            onChange={(e) => setInsightText(e.target.value)}
            placeholder="Tu insight más importante de hoy..."
            rows={3}
            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl font-sans text-sm text-stone-700 placeholder:text-stone-300 focus:border-stone-400 resize-none leading-relaxed transition-colors duration-200"
          />
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-4 rounded-xl font-sans text-sm font-medium tracking-wide transition-all duration-300 ${
          saved
            ? 'bg-stone-600 text-white'
            : 'bg-stone-800 text-white hover:bg-stone-900 disabled:opacity-50'
        }`}
      >
        {saving ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Guardando...
          </span>
        ) : saved ? (
          'Guardado'
        ) : (
          'Guardar entrada'
        )}
      </button>
      <p className="text-center font-sans text-xs text-stone-300">
        Escribe al menos 5 caracteres para que el día cuente en tu racha
      </p>
    </div>
  )
}
