-- Fix function search path issues
CREATE OR REPLACE FUNCTION public.generate_unique_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Drop overly permissive policies and create more restrictive ones
DROP POLICY IF EXISTS "Service can insert phone IDs" ON public.phone_unique_ids;
DROP POLICY IF EXISTS "Anyone can create transactions" ON public.transactions;

-- Phone unique IDs: Only authenticated users or service role can insert
CREATE POLICY "Authenticated users can insert phone IDs"
  ON public.phone_unique_ids FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Transactions: Authenticated users can create their own, or guest transactions (user_id is null)
CREATE POLICY "Users can create transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Anon users can create guest transactions"
  ON public.transactions FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);