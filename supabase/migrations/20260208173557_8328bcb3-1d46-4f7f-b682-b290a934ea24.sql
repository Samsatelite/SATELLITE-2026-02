
-- Add email and display_name columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;

-- Update the trigger function to capture email and name from Google auth
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, unique_id, referral_code, email, display_name)
  VALUES (
    NEW.id, 
    public.generate_unique_id(),
    public.generate_referral_code(),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$function$;

-- Fix security: restrict phone_unique_ids to authenticated users only
DROP POLICY IF EXISTS "Anyone can read phone IDs" ON public.phone_unique_ids;
DROP POLICY IF EXISTS "Anyone can insert phone IDs" ON public.phone_unique_ids;

CREATE POLICY "Authenticated users can read phone IDs" 
ON public.phone_unique_ids FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert phone IDs" 
ON public.phone_unique_ids FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix security: remove always-true INSERT for transactions (guest)
DROP POLICY IF EXISTS "Anon users can create guest transactions" ON public.transactions;

-- Fix security: admin_settings needs explicit permissive SELECT
DROP POLICY IF EXISTS "Admins can manage settings" ON public.admin_settings;
CREATE POLICY "Admins can manage settings" 
ON public.admin_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix security: referral_rewards INSERT policy for service role / triggers
CREATE POLICY "Service role can insert rewards" 
ON public.referral_rewards FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix profiles: ensure anon users can't access
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)));
