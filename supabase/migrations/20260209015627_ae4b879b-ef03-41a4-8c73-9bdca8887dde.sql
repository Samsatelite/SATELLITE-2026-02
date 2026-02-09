
-- Backfill existing profiles with email and display_name from auth.users
UPDATE public.profiles p
SET email = u.email,
    display_name = COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')
FROM auth.users u
WHERE p.user_id = u.id
  AND (p.email IS NULL OR p.display_name IS NULL);
