/*
  # Bitácora 21 - Schema inicial

  ## Tablas nuevas

  1. `users` - Perfil de usuario extendido
     - id: UUID, referencia a auth.users
     - name: nombre del usuario
     - email: correo único
     - start_date: fecha de inicio del programa (null hasta primer guardado válido)
     - current_streak: racha actual en días
     - longest_streak: racha más larga histórica
     - created_at: timestamp de creación

  2. `daily_content` - Contenido de cada día del programa (1-21)
     - id: serial
     - day_number: número del día (único)
     - stage_name: nombre de la etapa
     - video_embed_url: URL del video
     - meditation_embed_url: URL de meditación (opcional)
     - daily_quote: frase del día
     - questions_text: preguntas guía (opcional)
     - insight_prompt_text: prompt para el insight (opcional)
     - is_published: si está publicado

  3. `daily_entries` - Entradas diarias del diario
     - id: serial
     - user_id: referencia a users
     - day_number: número del día
     - entry_date: fecha UTC de la entrada
     - main_text: texto principal
     - insight_text: texto de insight
     - emotions: array de emociones seleccionadas
     - valid_day: si el día cuenta para la racha (mínimo 5 caracteres)

  ## Seguridad
  - RLS habilitado en las 3 tablas
  - Usuarios solo acceden a sus propios datos
  - Contenido diario es de solo lectura para usuarios autenticados
*/

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  start_date DATE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily content table
CREATE TABLE IF NOT EXISTS public.daily_content (
  id SERIAL PRIMARY KEY,
  day_number INTEGER UNIQUE NOT NULL,
  stage_name TEXT NOT NULL,
  video_embed_url TEXT NOT NULL,
  meditation_embed_url TEXT,
  daily_quote TEXT NOT NULL,
  questions_text TEXT,
  insight_prompt_text TEXT,
  is_published BOOLEAN DEFAULT true
);

-- Daily entries table
CREATE TABLE IF NOT EXISTS public.daily_entries (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  entry_date DATE NOT NULL,
  main_text TEXT,
  insight_text TEXT,
  emotions TEXT[],
  valid_day BOOLEAN DEFAULT false,
  UNIQUE(user_id, day_number)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "users_read_own"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Daily content policies (read-only for authenticated users)
CREATE POLICY "content_read_published"
  ON public.daily_content FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Daily entries policies
CREATE POLICY "entries_read_own"
  ON public.daily_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "entries_insert_own"
  ON public.daily_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "entries_update_own"
  ON public.daily_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_id ON public.daily_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_day_number ON public.daily_entries(day_number);
CREATE INDEX IF NOT EXISTS idx_daily_content_day_number ON public.daily_content(day_number);
