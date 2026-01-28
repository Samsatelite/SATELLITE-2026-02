-- Create app role enum for admin
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  phone_number TEXT,
  unique_id TEXT UNIQUE, -- 12-char alphanumeric for tracking
  referral_code TEXT UNIQUE, -- User's own referral code
  referred_by UUID REFERENCES public.profiles(id),
  referral_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table for admin roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create phone_unique_ids table for tracking per phone
CREATE TABLE public.phone_unique_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  unique_id TEXT NOT NULL UNIQUE, -- 12-char alphanumeric
  sms_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create networks table for admin control
CREATE TABLE public.networks (
  id TEXT PRIMARY KEY, -- mtn, airtel, glo, 9mobile
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  health_status TEXT DEFAULT 'healthy', -- healthy, degraded, critical
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create offers table for admin control
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network_id TEXT REFERENCES public.networks(id) NOT NULL,
  type TEXT NOT NULL, -- data, airtime
  size TEXT, -- for data plans like 1GB
  size_value INTEGER, -- in MB for sorting
  amount INTEGER NOT NULL, -- price
  validity TEXT, -- for data plans
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0, -- for "most used" sorting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  phone_numbers TEXT[] NOT NULL, -- array for bulk
  network_id TEXT REFERENCES public.networks(id) NOT NULL,
  offer_id UUID REFERENCES public.offers(id),
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, success, failed, refunded
  payment_method TEXT,
  is_bulk BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create referral_rewards table
CREATE TABLE public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_type TEXT NOT NULL, -- data, airtime
  reward_value TEXT NOT NULL, -- 1GB or 500
  is_claimed BOOLEAN DEFAULT false,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_unique_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- Create has_role function for RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to generate unique 12-char ID
CREATE OR REPLACE FUNCTION public.generate_unique_id()
RETURNS TEXT
LANGUAGE plpgsql
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

-- Create function to generate referral code (6 chars)
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
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

-- Create trigger function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, referral_code)
  VALUES (NEW.id, public.generate_referral_code());
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_networks_updated_at
  BEFORE UPDATE ON public.networks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- Profiles: Users can view/update their own profile, admins can view all
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User roles: Only admins can manage
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Phone unique IDs: Anyone can read (for lookup), service can insert
CREATE POLICY "Anyone can read phone IDs"
  ON public.phone_unique_ids FOR SELECT
  USING (true);

CREATE POLICY "Service can insert phone IDs"
  ON public.phone_unique_ids FOR INSERT
  WITH CHECK (true);

-- Networks: Anyone can read active, admins can modify
CREATE POLICY "Anyone can read networks"
  ON public.networks FOR SELECT
  USING (true);

CREATE POLICY "Admins can modify networks"
  ON public.networks FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Offers: Anyone can read active, admins can modify
CREATE POLICY "Anyone can read offers"
  ON public.offers FOR SELECT
  USING (true);

CREATE POLICY "Admins can modify offers"
  ON public.offers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Transactions: Users see own, admins see all
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update transactions"
  ON public.transactions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Referral rewards: Users see own
CREATE POLICY "Users can view own rewards"
  ON public.referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can claim own rewards"
  ON public.referral_rewards FOR UPDATE
  USING (auth.uid() = user_id AND is_claimed = false);

-- Insert initial network data
INSERT INTO public.networks (id, name, color, is_active, health_status) VALUES
  ('mtn', 'MTN', '#FFCC00', true, 'healthy'),
  ('airtel', 'Airtel', '#FF0000', true, 'healthy'),
  ('glo', 'Glo', '#00A651', true, 'healthy'),
  ('9mobile', '9mobile', '#006B3F', true, 'healthy');

-- Insert initial offers data
INSERT INTO public.offers (network_id, type, size, size_value, amount, validity, is_active, is_popular) VALUES
  -- MTN Data
  ('mtn', 'data', '500MB', 500, 140, '30 days', true, false),
  ('mtn', 'data', '1GB', 1024, 260, '30 days', true, true),
  ('mtn', 'data', '2GB', 2048, 520, '30 days', true, false),
  ('mtn', 'data', '3GB', 3072, 780, '30 days', true, false),
  ('mtn', 'data', '5GB', 5120, 1300, '30 days', true, false),
  ('mtn', 'data', '10GB', 10240, 2600, '30 days', true, false),
  -- Airtel Data
  ('airtel', 'data', '500MB', 500, 140, '30 days', true, false),
  ('airtel', 'data', '1GB', 1024, 260, '30 days', true, true),
  ('airtel', 'data', '2GB', 2048, 520, '30 days', true, false),
  ('airtel', 'data', '5GB', 5120, 1300, '30 days', true, false),
  ('airtel', 'data', '10GB', 10240, 2600, '30 days', true, false),
  -- Glo Data
  ('glo', 'data', '500MB', 500, 135, '30 days', true, false),
  ('glo', 'data', '1GB', 1024, 250, '30 days', true, true),
  ('glo', 'data', '2GB', 2048, 500, '30 days', true, false),
  ('glo', 'data', '5GB', 5120, 1250, '30 days', true, false),
  ('glo', 'data', '10GB', 10240, 2500, '30 days', true, false),
  -- 9mobile Data
  ('9mobile', 'data', '500MB', 500, 130, '30 days', true, false),
  ('9mobile', 'data', '1GB', 1024, 250, '30 days', true, true),
  ('9mobile', 'data', '2GB', 2048, 500, '30 days', true, false),
  ('9mobile', 'data', '5GB', 5120, 1200, '30 days', true, false),
  -- MTN Airtime
  ('mtn', 'airtime', NULL, NULL, 50, NULL, true, false),
  ('mtn', 'airtime', NULL, NULL, 100, NULL, true, true),
  ('mtn', 'airtime', NULL, NULL, 200, NULL, true, false),
  ('mtn', 'airtime', NULL, NULL, 500, NULL, true, false),
  ('mtn', 'airtime', NULL, NULL, 1000, NULL, true, false),
  ('mtn', 'airtime', NULL, NULL, 2000, NULL, true, false),
  -- Airtel Airtime
  ('airtel', 'airtime', NULL, NULL, 50, NULL, true, false),
  ('airtel', 'airtime', NULL, NULL, 100, NULL, true, true),
  ('airtel', 'airtime', NULL, NULL, 200, NULL, true, false),
  ('airtel', 'airtime', NULL, NULL, 500, NULL, true, false),
  ('airtel', 'airtime', NULL, NULL, 1000, NULL, true, false),
  ('airtel', 'airtime', NULL, NULL, 2000, NULL, true, false),
  -- Glo Airtime
  ('glo', 'airtime', NULL, NULL, 50, NULL, true, false),
  ('glo', 'airtime', NULL, NULL, 100, NULL, true, true),
  ('glo', 'airtime', NULL, NULL, 200, NULL, true, false),
  ('glo', 'airtime', NULL, NULL, 500, NULL, true, false),
  ('glo', 'airtime', NULL, NULL, 1000, NULL, true, false),
  ('glo', 'airtime', NULL, NULL, 2000, NULL, true, false),
  -- 9mobile Airtime
  ('9mobile', 'airtime', NULL, NULL, 50, NULL, true, false),
  ('9mobile', 'airtime', NULL, NULL, 100, NULL, true, true),
  ('9mobile', 'airtime', NULL, NULL, 200, NULL, true, false),
  ('9mobile', 'airtime', NULL, NULL, 500, NULL, true, false),
  ('9mobile', 'airtime', NULL, NULL, 1000, NULL, true, false),
  ('9mobile', 'airtime', NULL, NULL, 2000, NULL, true, false);