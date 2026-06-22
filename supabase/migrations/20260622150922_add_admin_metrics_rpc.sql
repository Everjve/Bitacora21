
-- RPC: admin metrics (bypasses RLS, restricted to admin role)
CREATE OR REPLACE FUNCTION get_admin_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role text;
  v_result jsonb;
BEGIN
  SELECT role INTO v_caller_role FROM public.users WHERE id = auth.uid();
  IF v_caller_role <> 'admin' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_build_object(
    'total_users',  (SELECT COUNT(*) FROM public.users),
    'active_today', (
      SELECT COUNT(DISTINCT user_id)
      FROM public.daily_entries
      WHERE entry_date = (NOW() AT TIME ZONE 'America/Bogota')::date
        AND valid_day = true
        AND day_number > 0
    ),
    'active_week',  (
      SELECT COUNT(DISTINCT user_id)
      FROM public.daily_entries
      WHERE entry_date >= (NOW() AT TIME ZONE 'America/Bogota')::date - INTERVAL '6 days'
        AND valid_day = true
        AND day_number > 0
    ),
    'users_day1',   (SELECT COUNT(DISTINCT user_id) FROM public.daily_entries WHERE day_number = 1  AND valid_day = true),
    'users_day7',   (SELECT COUNT(DISTINCT user_id) FROM public.daily_entries WHERE day_number = 7  AND valid_day = true),
    'users_day21',  (SELECT COUNT(DISTINCT user_id) FROM public.daily_entries WHERE day_number = 21 AND valid_day = true),
    'avg_streak',   (SELECT COALESCE(AVG(current_streak), 0) FROM public.users)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- RPC: admin abandonment data (bypasses RLS, restricted to admin role)
CREATE OR REPLACE FUNCTION get_admin_abandonment()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role text;
BEGIN
  SELECT role INTO v_caller_role FROM public.users WHERE id = auth.uid();
  IF v_caller_role <> 'admin' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN jsonb_build_object(
    -- For each tramo: users who reached start_day but NOT end_day
    'tramo_1_3', jsonb_build_object(
      'reached',   (SELECT COUNT(DISTINCT user_id) FROM public.daily_entries WHERE day_number >= 1 AND valid_day = true),
      'completed', (SELECT COUNT(DISTINCT user_id) FROM public.daily_entries WHERE day_number >= 3 AND valid_day = true)
    ),
    'tramo_4_7', jsonb_build_object(
      'reached',   (SELECT COUNT(DISTINCT user_id) FROM public.daily_entries WHERE day_number >= 4 AND valid_day = true),
      'completed', (SELECT COUNT(DISTINCT user_id) FROM public.daily_entries WHERE day_number >= 7 AND valid_day = true)
    ),
    'tramo_8_14', jsonb_build_object(
      'reached',   (SELECT COUNT(DISTINCT user_id) FROM public.daily_entries WHERE day_number >= 8  AND valid_day = true),
      'completed', (SELECT COUNT(DISTINCT user_id) FROM public.daily_entries WHERE day_number >= 14 AND valid_day = true)
    ),
    'tramo_15_21', jsonb_build_object(
      'reached',   (SELECT COUNT(DISTINCT user_id) FROM public.daily_entries WHERE day_number >= 15 AND valid_day = true),
      'completed', (SELECT COUNT(DISTINCT user_id) FROM public.daily_entries WHERE day_number >= 21 AND valid_day = true)
    )
  );
END;
$$;
