# Development Guide

This document provides context, learning resources, and development practices for the Gentle Path trauma-informed student support platform.

## 🎉 Current Status: MVP Milestone 1 Complete

**What's Working:**
- Full user authentication system with Supabase
- Protected routes with session management
- Real-time dashboard with user's actual progress data
- Quick check-in functionality (saves to database)
- Complete check-in flow with AI suggestions, timer, and little wins
- All data persistence working with proper user isolation via RLS

**Current Database Schema:**
- `users` - User profiles with consent tracking
- `checkins` - Daily mood/energy/focus check-ins
- `little_wins` - Achievement tracking
- `assignments`, `plans`, `plan_steps` - Ready for future features

## Technology Stack Overview

### Frontend Framework: Next.js 14

**What it is**: React-based full-stack framework with file-based routing, server components, and built-in optimization.

**Why we chose it**: 
- Excellent performance with automatic optimization
- Server-side rendering for better SEO and initial load times
- Built-in API routes eliminate need for separate backend
- Large community and extensive documentation

**Learning Resources**:
- [Next.js Official Tutorial](https://nextjs.org/learn) - Interactive step-by-step guide
- [Next.js 14 App Router Guide](https://nextjs.org/docs/app) - New routing system we're using
- [React 18 Documentation](https://react.dev/) - Understanding React concepts

### Styling: Tailwind CSS

**What it is**: Utility-first CSS framework that provides low-level utility classes.

**Why we chose it**: 
- Rapid prototyping with consistent design system
- Trauma-informed design requires precise control over spacing, colors, and visual hierarchy
- Excellent purging means small bundle sizes
- Easy to maintain consistent design tokens

**Learning Resources**:
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Comprehensive reference
- [Tailwind Play](https://play.tailwindcss.com/) - Online playground for experimenting
- [Color Palette Tool](https://tailwindcss.com/docs/customizing-colors) - Understanding our warm color system

**Our Custom Design System** (`tailwind.config.ts`):
```javascript
// Warm, trauma-informed palette
primary: { 500: '#dc8850' }    // Warm orange for primary actions
secondary: { 500: '#d1ab5c' }  // Beige for secondary elements  
neutral: { 500: '#a99d8b' }    // Warm gray for text
background: '#fefcfa'          // Warm white background
```

### Database: Supabase ✅ Fully Integrated

**What it is**: Open-source Firebase alternative with PostgreSQL database, real-time subscriptions, and built-in authentication.

**Why we chose it**:
- Privacy-focused (important for trauma-informed care)
- PostgreSQL provides powerful querying capabilities
- Built-in row-level security for data protection
- Real-time features for live updates
- Generous free tier for development

**Current Implementation:**
- User authentication with email verification
- Row-level security ensuring data privacy
- Real-time progress stats loading
- Database migrations with safe schema updates
- Helper functions for all CRUD operations

**Learning Resources**:
- [Supabase Documentation](https://supabase.com/docs) - Complete guide
- [Supabase + Next.js Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs) - Integration guide
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/) - Understanding the underlying database

**Migration Files:**
- `001_initial_schema.sql` - Full schema (reference)
- `002_safe_schema.sql` - Safe deployment version
- `003_fix_users_policy.sql` - User table INSERT policy fix

### State Management & Data Fetching ✅ Implemented

**Current Approach**: 
- React Context (`AuthContext`) for user session state
- Server Components for initial data loading  
- Client Components for interactive features
- Direct Supabase calls for real-time data updates

**Implementation Details:**
- `AuthContext` manages login state across the app
- Protected routes redirect to `/auth` if not authenticated
- Real-time stats updates when check-ins are submitted
- Loading states handled throughout the UI

**Learning Resources**:
- [Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns) - When to use each
- [Data Fetching in Next.js](https://nextjs.org/docs/app/building-your-application/data-fetching) - Best practices

### AI Integration: OpenAI API 🚧 Mock Implementation

**Current Status**: Mock AI responses implemented in `/api/suggestions`
**Future**: Replace with real OpenAI GPT-4 integration

**Current Implementation:**
- Trauma-informed suggestion templates based on check-in data
- Crisis detection for very low mood/energy scores
- Server-side API route with proper error handling
- Fallback responses if suggestion generation fails

**What we'll use**: GPT-4 for trauma-informed academic coaching suggestions

**Implementation Strategy**:
- Server-side API routes to protect API keys
- Structured prompts with trauma-informed guidelines
- Fallback responses for API failures
- Rate limiting and cost management

**Learning Resources**:
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference) - API reference
- [Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering) - Writing effective prompts
- [AI Safety Best Practices](https://platform.openai.com/docs/guides/safety-best-practices) - Important for our use case

### Testing: Vitest + Testing Library

**What it is**: Fast unit testing with React component testing utilities.

**Why we chose it**:
- Faster than Jest, better ESM support
- Excellent React component testing capabilities
- Important for trauma-informed features that must work reliably

**Learning Resources**:
- [Vitest Documentation](https://vitest.dev/) - Testing framework
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - Component testing
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) - Avoiding common mistakes

## Development Workflow

### 1. Component Development Pattern

```typescript
// 1. Start with types (in types/ folder)
interface CheckInData {
  mood: number;
  energy: number;
  focus: number;
}

// 2. Build component with accessibility
export default function CheckInForm() {
  return (
    <form className="space-y-4" role="form" aria-label="Morning check-in">
      {/* Trauma-informed: clear labels, no pressure */}
    </form>
  );
}

// 3. Write tests
test('check-in form is accessible', () => {
  render(<CheckInForm />);
  expect(screen.getByRole('form')).toBeInTheDocument();
});
```

### 2. API Route Pattern

```typescript
// app/api/checkins/route.ts
export async function POST(request: Request) {
  // 1. Validate input
  // 2. Check authentication
  // 3. Save to Supabase
  // 4. Return response
}
```

### 3. Database Migration Pattern

```sql
-- Always reversible migrations
-- Clear naming: 001_create_checkins_table.sql
CREATE TABLE checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Trauma-Informed Development Principles

### 1. Language and Tone
- **Avoid**: "failure", "behind", "missed", "should have"
- **Use**: "building momentum", "next step", "when you're ready"
- **Always include**: "not now" options to prevent overwhelm

### 2. Visual Design
- **Soft colors**: Our warm palette reduces visual stress
- **Generous spacing**: Prevents cramped, overwhelming interfaces  
- **Clear hierarchy**: Users shouldn't guess what to do next
- **Progressive disclosure**: Show only what's needed now

### 3. Interaction Patterns
- **No forced actions**: Always provide gentle exits
- **Clear feedback**: Users know what happened and what's next  
- **Forgiving defaults**: Pre-select reasonable options
- **Keyboard accessible**: Essential for users with motor challenges

### 4. Data Handling
- **Minimal collection**: Only store what's necessary
- **Clear consent**: Users understand what data is saved
- **Easy deletion**: Users can remove their data
- **No tracking**: Respect privacy completely

## Code Style & Conventions

### File Organization
```
app/
├── (auth)/          # Route groups for organization
├── checkin/         # Feature-based routing
└── api/
    ├── checkins/    # REST endpoints
    └── ai/          # AI-related endpoints

components/
├── ui/              # Reusable UI primitives
├── forms/           # Form components
└── layout/          # Layout components
```

### Naming Conventions
- **Components**: PascalCase (`CheckInForm.tsx`)
- **Functions**: camelCase (`handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_SUGGESTIONS`)
- **CSS classes**: Follow Tailwind conventions

### TypeScript Usage
- Always define interfaces for data shapes
- Use strict mode settings
- Avoid `any` - use `unknown` if needed
- Export types from centralized `types/` folder

## Common Development Tasks

### Adding a New Component
1. Create in appropriate `components/` subfolder
2. Define TypeScript interface if it accepts props
3. Add accessibility attributes (`role`, `aria-label`)
4. Test with keyboard navigation
5. Write unit test focusing on user behavior
6. Update Storybook if using visual testing

### Adding a Database Table
1. Write migration script with clear naming
2. Add TypeScript types in `types/database.ts`
3. Create Supabase helper functions in `lib/supabase.ts`
4. Add row-level security policies
5. Test with different user roles

### Adding an AI Feature
1. Design system prompt with trauma-informed guidelines
2. Create mock responses for development
3. Implement with proper error handling
4. Add rate limiting and cost tracking
5. Test edge cases (API failures, inappropriate responses)

## Debugging & Troubleshooting

### Common Issues
- **Hydration errors**: Check server/client component usage
- **Tailwind not applying**: Verify `content` paths in config
- **Supabase connection**: Check environment variables
- **Type errors**: Ensure database types are updated

### Useful Commands
```bash
# Check Next.js bundle analyzer
npm run build -- --analyze

# Debug database queries
npx supabase logs

# Test accessibility
npm run test -- --coverage

# Check for unused dependencies  
npx depcheck
```

## Resources for Trauma-Informed Design

### Academic Sources
- [Trauma-Informed Design Principles](https://www.cdc.gov/violenceprevention/pdf/trauma-informed-design-guidelines.pdf) - CDC Guidelines
- [SAMHSA Trauma-Informed Care](https://www.samhsa.gov/trauma-informed-care) - Core principles
- [Digital Mental Health Guidelines](https://www.orygen.org.au/training-learning/resources-training/clinical-and-practice-resources/digital-mental-health) - Orygen Institute

### Design Resources
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/) - Universal accessibility
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - WCAG 2.1 compliance
- [Color Accessibility](https://webaim.org/resources/contrastchecker/) - Contrast checking tools

## Getting Help

### Internal Resources
- Check `CLAUDE.md` for AI assistant guidelines
- Review existing component patterns before creating new ones
- Use TypeScript errors as guidance - they're usually helpful

### External Communities
- [Next.js Discord](https://discord.gg/nextjs) - Active community
- [Supabase Discord](https://discord.supabase.com/) - Database questions
- [Tailwind Discord](https://discord.gg/tailwindcss) - Styling help
- [a11y Slack](https://web-a11y.slack.com/) - Accessibility questions

### Emergency Contacts
If you encounter content related to self-harm or crisis situations during development, consult:
- [Crisis Text Line](https://www.crisistextline.org/) - Text HOME to 741741
- [National Suicide Prevention Lifeline](https://suicidepreventionlifeline.org/) - 988