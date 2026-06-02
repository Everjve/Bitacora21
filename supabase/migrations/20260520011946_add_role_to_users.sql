/*
  # Add role column to users table

  1. Changes
    - Adds `role` column to `users` table with default value 'user'
    - Sets role = 'admin' for the primary admin email

  2. Security
    - Only admins should be able to update this column (enforced via app logic)
*/

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

UPDATE public.users SET role = 'admin' WHERE email = 'everjvega@gmail.com';
