# Base

A trauma-informed student support platform that reduces overwhelm, builds momentum with tiny "wins," and offers dignified, compassionate guidance for academics and wellbeing.

**🎉 MVP Milestone 1 Complete**: Full morning check-in flow with real user authentication and data persistence.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account (for database and authentication)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd trauma-ed-platform

# Install dependencies
npm install

# Set up environment variables
# Create .env.local with your Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

### Development
```bash
npm run dev          # Start development server (hot reload)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing
```bash
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
```

## Database Setup

### Supabase Configuration

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the database migrations** in Supabase SQL Editor:
   - Copy contents from `supabase/migrations/002_safe_schema.sql`
   - Run the migration to create tables and policies
   - If you get policy errors, also run `supabase/migrations/003_fix_users_policy.sql`

3. **Configure environment variables** in `.env.local`:

```bash
# Required: Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Future: OpenAI integration
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
trauma-ed-platform/
├── app/                    # Next.js App Router pages and layouts
│   ├── auth/              # Authentication pages
│   ├── checkin/           # Full check-in flow page
│   ├── api/               # API routes (AI suggestions)
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Protected home page with dashboard
├── components/            # Reusable UI components
│   ├── AuthForm.tsx       # Sign in/up form
│   ├── CheckInCard.tsx    # Home page check-in widget
│   ├── CheckInForm.tsx    # Full check-in form
│   ├── GrowthVisual.tsx   # Progress tracking visualization
│   ├── SmartSuggestionBox.tsx  # Daily inspiration quotes
│   └── ...               # Other flow components
├── contexts/              # React context providers
│   └── AuthContext.tsx    # User authentication state
├── lib/                   # Utility functions and configurations
│   └── supabase.ts        # Database client and helper functions
├── supabase/              # Database migrations
│   └── migrations/        # SQL migration files
├── types/                 # TypeScript type definitions
├── tailwind.config.ts     # Tailwind CSS configuration with warm palette
└── next.config.js         # Next.js configuration
```

## Design System

### Colors
- **Primary**: Warm oranges (#dc8850) - for primary actions and highlights
- **Secondary**: Warm beige/tan (#d1ab5c) - for secondary elements  
- **Neutral**: Warm grays (#a99d8b) - for text and subtle backgrounds
- **Background**: Warm white (#fefcfa) - main background color

### Typography
- **Display**: Young Serif - for headings and emotional warmth
- **Body**: Inter - for readable body text and UI elements

### Spacing & Borders
- Generous padding and soft rounded corners (8px-12px)
- Calm, low-stimulus spacing designed for focus

## Features

### ✅ Implemented (MVP Milestone 1)

**Authentication & User Management**
- Secure sign up/sign in with Supabase Auth
- Email verification and password reset
- Protected routes and session management

**Morning Check-in Flow**
1. **Quick Check-in** (30-60s): Mood, energy, focus ratings → saves to database
2. **Full Check-in Flow**: Complete journey with AI suggestions, timer, and little wins
3. **AI Suggestions**: ≤2 trauma-informed suggestions based on check-in data (mock responses)
4. **Focus Timer**: Optional timed focus sessions with task context
5. **Little Wins**: Log small accomplishments with predefined categories → saves to database
6. **Growth Tracking**: Real-time progress visualization with user's actual data

**Dashboard & Home Screen**
- Smart suggestion box with daily rotating quotes
- Interactive growth visualization with 4 key metrics
- Check-in card with both quick and full flow options
- Personalized greeting and real progress stats

### 🚧 Planned Features

**AI Integration**
- Replace mock suggestions with real OpenAI API calls
- Personalized suggestions based on user history and patterns

**"Falling Behind" Flow**
- Assignment triage and micro-step generation
- Respectful professor communication drafts

**Enhanced Analytics**
- Streak calculation and motivation
- Weekly/monthly progress reports
- Pattern recognition and insights

## Contributing

See `DEVELOPMENT.md` for detailed development guidelines, framework explanations, and learning resources.

## Privacy & Ethics

- **Trauma-informed design**: Compassionate, non-judgmental interface
- **Privacy-first**: Minimal data collection with clear consent
- **Growth-oriented**: No shame language, positive reinforcement
- **Accessible**: Keyboard navigation and screen reader support
