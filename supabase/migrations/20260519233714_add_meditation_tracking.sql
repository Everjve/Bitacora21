/*
  # Agregar seguimiento de meditaciones

  1. Cambios en `users`
     - `meditation_days` (int, default 0): contador de días en que el usuario completó la meditación

  2. Cambios en `daily_entries`
     - `meditated` (boolean, default false): si el usuario escuchó la meditación del día
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'meditation_days'
  ) THEN
    ALTER TABLE users ADD COLUMN meditation_days int NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_entries' AND column_name = 'meditated'
  ) THEN
    ALTER TABLE daily_entries ADD COLUMN meditated boolean NOT NULL DEFAULT false;
  END IF;
END $$;
