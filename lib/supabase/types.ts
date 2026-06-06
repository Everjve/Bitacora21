export interface User {
  id: string
  name: string
  email: string
  role: string
  timezone: string
  start_date: string | null
  current_streak: number
  longest_streak: number
  meditation_days: number
  created_at: string
}

export interface DailyContent {
  id: number
  day_number: number
  stage_name: string
  video_embed_url: string
  meditation_embed_url: string | null
  daily_quote: string
  questions_text: string | null
  insight_prompt_text: string | null
  is_published: boolean
}

export interface DailyEntry {
  id: number
  user_id: string
  day_number: number
  entry_date: string
  main_text: string | null
  insight_text: string | null
  emotions: string[] | null
  valid_day: boolean
  meditated: boolean
}

export const EMOTIONS = [
  { name: 'Inspirado', color: '#F4B400' },
  { name: 'Entusiasmado', color: '#FF6F00' },
  { name: 'Alegre', color: '#FFD600' },
  { name: 'Agradecido', color: '#66BB6A' },
  { name: 'Sereno', color: '#4FC3F7' },
  { name: 'En Paz', color: '#26A69A' },
  { name: 'Confundido', color: '#78909C' },
  { name: 'Ansioso', color: '#8E24AA' },
  { name: 'Frustrado', color: '#F4511E' },
  { name: 'Enojado', color: '#D32F2F' },
  { name: 'Triste', color: '#1976D2' },
  { name: 'Desmotivado', color: '#616161' },
] as const
