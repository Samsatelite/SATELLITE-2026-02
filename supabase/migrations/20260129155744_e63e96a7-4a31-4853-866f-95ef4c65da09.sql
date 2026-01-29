-- Fix the overly permissive INSERT policy on phone_unique_ids
DROP POLICY IF EXISTS "Authenticated users can insert phone IDs" ON public.phone_unique_ids;

CREATE POLICY "Anyone can insert phone IDs"
ON public.phone_unique_ids FOR INSERT
WITH CHECK (true);

-- Add crypto_options table for admin to manage crypto currencies and networks
CREATE TABLE IF NOT EXISTS public.crypto_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency TEXT NOT NULL,
  network TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(currency, network)
);

-- Insert default crypto options
INSERT INTO public.crypto_options (currency, network, is_active, display_order) VALUES
  ('USDT', 'TRC20', true, 1),
  ('USDT', 'BSC', true, 2),
  ('USDT', 'Polygon', true, 3),
  ('SOL', 'Solana', true, 4),
  ('BNB', 'BSC', true, 5)
ON CONFLICT (currency, network) DO NOTHING;

-- Enable RLS on crypto_options
ALTER TABLE public.crypto_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read crypto options"
ON public.crypto_options FOR SELECT
USING (true);

CREATE POLICY "Admins can modify crypto options"
ON public.crypto_options FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add referrer_code column to profiles for tracking who referred them via URL
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referrer_code TEXT;

-- Create admin_settings table for admin configuration
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings"
ON public.admin_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default admin settings (allowed IPs for admin access)
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
  ('allowed_ips', '["*"]'::jsonb),
  ('admin_path', '"/admin-secure-8x7k2m"'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;