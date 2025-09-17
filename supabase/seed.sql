-- Seed data for development and testing
-- This creates a test user and sample data for the trauma-informed platform

-- Note: In real usage, users will be created through Supabase Auth
-- This is just for development testing

-- Sample check-ins (showing gradual improvement over time)
INSERT INTO checkins (user_id, mood, energy, focus, notes, created_at) VALUES
  -- Week 1: Lower scores (realistic for someone starting)
  ('00000000-0000-0000-0000-000000000001', 2, 2, 2, 'Feeling overwhelmed with midterms coming up', NOW() - INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000001', 2, 3, 2, 'Slept better but still anxious', NOW() - INTERVAL '6 days'),
  ('00000000-0000-0000-0000-000000000001', 3, 2, 3, 'Got a little work done yesterday', NOW() - INTERVAL '5 days'),
  
  -- Week 2: Gradual improvement (trauma-informed growth)
  ('00000000-0000-0000-0000-000000000001', 3, 3, 3, 'Using the 15-min timer helped', NOW() - INTERVAL '4 days'),
  ('00000000-0000-0000-0000-000000000001', 3, 4, 3, 'Feeling a bit more momentum', NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000001', 4, 3, 4, 'Had a good study session', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000001', 4, 4, 4, 'Feeling more in control', NOW() - INTERVAL '1 day');

-- Sample assignments (realistic college workload)
INSERT INTO assignments (user_id, course, title, due_at, impact, est_minutes, status) VALUES
  -- Due today/tomorrow (high stress)
  ('00000000-0000-0000-0000-000000000001', 'PSYC 101', 'Research Paper Draft', NOW() + INTERVAL '1 day', 5, 180, 'not_started'),
  ('00000000-0000-0000-0000-000000000001', 'MATH 205', 'Problem Set 4', NOW() + INTERVAL '2 days', 4, 90, 'in_progress'),
  
  -- Due this week (manageable)
  ('00000000-0000-0000-0000-000000000001', 'ENG 150', 'Reading Response', NOW() + INTERVAL '5 days', 3, 45, 'not_started'),
  ('00000000-0000-0000-0000-000000000001', 'HIST 201', 'Chapter 8 Reading', NOW() + INTERVAL '6 days', 2, 60, 'not_started'),
  
  -- Completed (for progress tracking)
  ('00000000-0000-0000-0000-000000000001', 'PSYC 101', 'Quiz 3', NOW() - INTERVAL '2 days', 3, 30, 'completed'),
  ('00000000-0000-0000-0000-000000000001', 'MATH 205', 'Problem Set 3', NOW() - INTERVAL '5 days', 4, 120, 'completed');

-- Sample little wins (trauma-informed positive reinforcement)
INSERT INTO little_wins (user_id, category, description, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'academic', 'Finished reading one section', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000001', 'self_care', 'Took a 10-minute walk', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000001', 'academic', 'Started the research paper outline', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000001', 'personal', 'Organized my desk space', NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000001', 'social', 'Checked in with study group', NOW() - INTERVAL '4 days');

-- Sample AI plans (what the AI suggestions would generate)
INSERT INTO plans (user_id, trigger, summary, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'morning', 'Focus on small steps for your research paper. Start with just 15 minutes of outlining.', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000001', 'morning', 'Your energy is good today. Try tackling one math problem to build momentum.', NOW() - INTERVAL '2 days');

-- Sample plan steps
INSERT INTO plan_steps (plan_id, assignment_id, label, est_min, status) VALUES
  -- Yesterday's plan
  ((SELECT id FROM plans WHERE trigger = 'morning' ORDER BY created_at DESC LIMIT 1 OFFSET 1),
   (SELECT id FROM assignments WHERE title = 'Research Paper Draft'),
   'Create basic outline with 3 main points',
   15,
   'completed'),
   
  ((SELECT id FROM plans WHERE trigger = 'morning' ORDER BY created_at DESC LIMIT 1 OFFSET 1),
   NULL,
   'Take a 5-minute break and breathe',
   5,
   'completed'),
   
  -- Today's plan  
  ((SELECT id FROM plans WHERE trigger = 'morning' ORDER BY created_at DESC LIMIT 1),
   (SELECT id FROM assignments WHERE title = 'Problem Set 4'),
   'Work through problem 1 step by step',
   20,
   'pending'),
   
  ((SELECT id FROM plans WHERE trigger = 'morning' ORDER BY created_at DESC LIMIT 1),
   NULL,
   'Celebrate completing one problem',
   2,
   'pending');