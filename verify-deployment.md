# Pre-Deployment Checklist

## Test these locally before deploying:

### 1. Authentication
- [ ] Can log in successfully
- [ ] Auth redirects work properly

### 2. Assignments
- [ ] Can view assignments list
- [ ] Can create new assignment
- [ ] Can edit existing assignment
- [ ] Can delete assignment
- [ ] Assignment autocomplete suggestions work

### 3. Check-ins
- [ ] Morning check-in form works
- [ ] Check-in saves successfully

### 4. Profile
- [ ] Profile setup page loads
- [ ] Can save profile information

## Verify in Supabase Dashboard:

### Required Tables:
- [ ] `users` table exists with columns: id, email, full_name, display_name, school, academic_year
- [ ] `assignments` table exists with columns: id, user_id, course, title, description, due_at, impact, est_minutes, status
- [ ] `checkins` table exists with columns: id, user_id, mood, energy, focus, notes

## If Issues Occur:

### Quick Rollback:
```bash
# Revert TypeScript changes if needed
git checkout HEAD -- tsconfig.json lib/supabase.ts types/
```

### Alternative Fix:
Instead of removing types entirely, we could:
1. Generate proper types from Supabase: `npx supabase gen types typescript`
2. Use those generated types instead