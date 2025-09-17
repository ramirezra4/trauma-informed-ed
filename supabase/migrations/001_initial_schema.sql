-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums for type safety
CREATE TYPE assignment_status AS ENUM ('not_started', 'in_progress', 'completed', 'dropped');
CREATE TYPE plan_trigger AS ENUM ('morning', 'falling_behind');
CREATE TYPE plan_step_status AS ENUM ('pending', 'completed', 'skipped');
CREATE TYPE little_win_category AS ENUM ('academic', 'self_care', 'social', 'personal', 'other');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  consent_at TIMESTAMPTZ NOT NULL, -- GDPR/privacy compliance
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily check-ins for trauma-informed tracking
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  energy INTEGER NOT NULL CHECK (energy >= 1 AND energy <= 5),
  focus INTEGER NOT NULL CHECK (focus >= 1 AND focus <= 5),
  notes TEXT, -- Optional, user can choose to add context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments/tasks (manually entered, no LMS integration in MVP)
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course TEXT NOT NULL,
  title TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 5), -- How important/stressful
  est_minutes INTEGER NOT NULL CHECK (est_minutes > 0),
  status assignment_status DEFAULT 'not_started',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-generated plans (morning check-in or falling behind)
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trigger plan_trigger NOT NULL,
  summary TEXT NOT NULL, -- AI-generated summary of the plan
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual steps within a plan
CREATE TABLE plan_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  label TEXT NOT NULL, -- "Review Chapter 3 for 15 minutes"
  est_min INTEGER NOT NULL CHECK (est_min > 0),
  status plan_step_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Little wins tracking (trauma-informed positive reinforcement)
CREATE TABLE little_wins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category little_win_category NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_checkins_user_created ON checkins(user_id, created_at DESC);
CREATE INDEX idx_assignments_user_due ON assignments(user_id, due_at);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_plans_user_created ON plans(user_id, created_at DESC);
CREATE INDEX idx_plan_steps_plan ON plan_steps(plan_id);
CREATE INDEX idx_little_wins_user_created ON little_wins(user_id, created_at DESC);

-- Row Level Security (RLS) policies for privacy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE little_wins ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own checkins" ON checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own assignments" ON assignments FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own plans" ON plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plans" ON plans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own plan steps" ON plan_steps 
  FOR ALL USING (auth.uid() = (SELECT user_id FROM plans WHERE id = plan_id));

CREATE POLICY "Users can manage own little wins" ON little_wins FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();