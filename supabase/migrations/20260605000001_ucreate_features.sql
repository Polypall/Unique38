-- Extend profiles table with new maker fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_type TEXT DEFAULT 'artist';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coin_count INTEGER DEFAULT 0;

-- follows: users can follow each other (wrench icon action)
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
-- Anyone can see follow relationships (used to show follower counts)
CREATE POLICY "follows_select_all" ON public.follows FOR SELECT USING (true);
-- Users can only create follows where they are the follower
CREATE POLICY "follows_insert_own" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
-- Users can only delete their own follows
CREATE POLICY "follows_delete_own" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- reports: red alarm button submissions
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  post_id UUID,
  reason TEXT DEFAULT 'reported',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
-- Reporters can create reports; admins review via service role
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
-- Users can only see their own submitted reports
CREATE POLICY "reports_select_own" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- match_history: stores AI video match sessions
CREATE TABLE IF NOT EXISTS public.match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  matched_type TEXT NOT NULL CHECK (matched_type IN ('inventor', 'investor', 'startup')),
  field TEXT,
  room_id TEXT,
  duration_seconds INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
-- Users can only view their own match history
CREATE POLICY "match_history_select_own" ON public.match_history FOR SELECT USING (auth.uid() = user_id);
-- Users can only insert records for themselves
CREATE POLICY "match_history_insert_own" ON public.match_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- daily_rewards: Art Galaxy Coin — 1 awarded per login day
CREATE TABLE IF NOT EXISTS public.daily_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  awarded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  coins INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, awarded_date)  -- prevents double-awarding on same day
);
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_rewards_select_own" ON public.daily_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_rewards_insert_own" ON public.daily_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

-- waitlist: email capture for pre-launch interest
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
-- Anyone (including anonymous visitors) can join the waitlist
CREATE POLICY "waitlist_insert_anon" ON public.waitlist FOR INSERT WITH CHECK (true);
-- Only service role can read the waitlist (admin only)
