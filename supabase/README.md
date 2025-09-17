# Database Setup Instructions

## Quick Setup (Supabase Dashboard)

1. **Create Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Run Migration**: Copy the contents of `migrations/001_initial_schema.sql` and run it in the SQL Editor
3. **Add Seed Data** (optional): Copy contents of `seed.sql` and run it for test data
4. **Get Credentials**: Go to Settings > API and copy:
   - Project URL
   - Public anon key
5. **Configure App**: Add credentials to `.env.local`

## Schema Overview

### Core Tables

**`users`** - Extends Supabase auth with trauma-informed fields
- `consent_at` - Privacy compliance timestamp
- `display_name` - Preferred name (trauma-sensitive)

**`checkins`** - Daily emotional state tracking (1-5 scales)
- `mood`, `energy`, `focus` - Core metrics for AI suggestions
- `notes` - Optional context (user choice)

**`assignments`** - Academic tasks
- `impact` (1-5) - Stress/importance level
- `est_minutes` - Time estimation for micro-planning
- Status tracking with positive language

**`plans`** - AI-generated suggestions
- `trigger` - Context (morning check-in vs falling behind)
- `summary` - Compassionate guidance text

**`plan_steps`** - Actionable micro-tasks
- `est_min` - Small time commitments (trauma-informed)
- Linked to assignments or standalone

**`little_wins`** - Positive reinforcement tracking
- Categories: academic, self_care, social, personal, other
- Growth-oriented progress tracking

### Privacy & Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- No cross-user data leakage
- GDPR-compliant with `consent_at` tracking

### Performance

- Indexes on common query patterns
- Efficient lookups for AI context gathering
- Optimized for real-time morning check-ins

## Development Queries

```sql
-- Get user's recent emotional patterns (for AI context)
SELECT mood, energy, focus, created_at 
FROM checkins 
WHERE user_id = $1 
ORDER BY created_at DESC 
LIMIT 7;

-- Get urgent assignments (falling behind detection)
SELECT * FROM assignments 
WHERE user_id = $1 
  AND status != 'completed'
  AND due_at < NOW() + INTERVAL '2 days'
ORDER BY impact DESC, due_at ASC;

-- Get growth stats (never show declining metrics)
SELECT 
  COUNT(*) as total_checkins,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_assignments,
  AVG(mood) as avg_mood_trend
FROM checkins c
LEFT JOIN assignments a ON c.user_id = a.user_id
WHERE c.user_id = $1 
  AND c.created_at >= NOW() - INTERVAL '30 days';
```

## Migration Commands

If using Supabase CLI:

```bash
# Initialize Supabase in project
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Push migration
supabase db push

# Seed data (optional)
supabase db seed
```