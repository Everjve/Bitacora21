/*
  # Agregar columna timezone a users

  - `timezone` (text, default 'America/Bogota'): zona horaria del usuario detectada al registrarse
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE users ADD COLUMN timezone text NOT NULL DEFAULT 'America/Bogota';
  END IF;
END $$;

-- Actualizar usuarios existentes que no tengan timezone
UPDATE users SET timezone = 'America/Bogota' WHERE timezone IS NULL;