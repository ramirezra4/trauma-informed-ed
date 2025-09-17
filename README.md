# Gentle Path

A trauma-informed student support tool that reduces overwhelm, builds momentum with tiny "wins," and offers dignified, compassionate guidance for academics and wellbeing.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd trauma-ed-platform

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

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

## Environment Variables

Create `.env.local` and configure:

```bash
# Supabase (when ready)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (when ready)
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
trauma-ed-platform/
├── app/                 # Next.js App Router pages and layouts
│   ├── globals.css     # Global styles and Tailwind imports
│   ├── layout.tsx      # Root layout with fonts and metadata
│   └── page.tsx        # Home page
├── components/         # Reusable UI components
├── lib/               # Utility functions and configurations
├── types/             # TypeScript type definitions
├── tailwind.config.ts # Tailwind CSS configuration with warm palette
└── next.config.js     # Next.js configuration
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

## Core Features (Planned)

### MVP - Morning Check-in Flow
1. **Quick Check-in** (30-60s): Mood, energy, focus ratings
2. **AI Suggestions**: ≤2 trauma-informed suggestions based on check-in
3. **Focus Timer**: Optional 15-minute focus session
4. **Little Wins**: Log small accomplishments with predefined categories
5. **Growth Tracking**: Cumulative progress (streaks pause, never reset)

### Future - "Falling Behind" Flow  
- Assignment triage and micro-step generation
- Respectful professor communication drafts

## Contributing

See `DEVELOPMENT.md` for detailed development guidelines, framework explanations, and learning resources.

## Privacy & Ethics

- **Trauma-informed design**: Compassionate, non-judgmental interface
- **Privacy-first**: Minimal data collection with clear consent
- **Growth-oriented**: No shame language, positive reinforcement
- **Accessible**: Keyboard navigation and screen reader support