# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Credit Halo is a gamified financial wellness mobile app focused on **community** and **goal setting**. The core vision: change the way people talk about money by making financial conversations open, supportive, and judgment-free. Built with React Native + Expo SDK 54, written in JavaScript (no TypeScript).

Key pillars: community-driven accountability, financial goal tracking with AI insights, gamified education, and a comprehensive money management hub.

## Commands

```bash
# Mobile App (from project root)
pnpm install                # Install dependencies
npm start                   # Expo dev server (LAN mode)
npm run start:tunnel        # Expo dev server with ngrok tunnel
npm run android             # Run on Android
npm run ios                 # Run on iOS
npm run web                 # Run on web

# Landing Page (from landing/)
cd landing && npm install
npm start                   # Runs on http://127.0.0.1:3456
```

No test runner or linter is configured.

## Architecture

**Detailed docs**: See `docs/architecture.md` for full diagrams and tables.

### Entry Flow

`App.js` → hydrates Zustand store from AsyncStorage (`@credithalo_store`) → renders `AppNavigator`.

### Navigation (`src/navigation/AppNavigator.js`)

Root Stack → Bottom Tab Navigator (5 tabs) → Nested stacks for Money and Goals.

| Tab | Screen | Nested? |
|-----|--------|---------|
| Dashboard | `DashboardScreen` | No |
| Money | `MoneyHubScreen` | Yes — 8 sub-screens (Spending, Budget, Accounts, Investments, Subscriptions, Bills, CreditScoreSim, DebtPayoff) |
| Learn | `LearnScreen` | No |
| Community | `CommunityScreen` | No |
| Goals | `GoalsScreen` | Yes — GoalDetail, SavingsChallenges |

Modal screens: Settings, Chatbot, HealthScore, Achievements, LessonDetail.

Custom tab bar: `PremiumTabBar` (glassmorphic, `expo-blur`).

### State Management (Zustand)

Store in `src/store/useStore.js`, composed from 7 slices in `src/store/slices/`:

| Slice | Domain | Key State |
|-------|--------|-----------|
| `authSlice` | Auth | `user`, `isLoggedIn`, `bankLinked` |
| `educationSlice` | Learning | `streak`, `completedLessons[]` |
| `financeSlice` | Money data | `transactions`, `budgets`, `subscriptions`, `accounts`, `holdings`, `bills` |
| `goalsSlice` | Goals | `goals[]` (with milestones, AI analysis, progress tracking) |
| `gamificationSlice` | XP/Rewards | `xp`, `level`, `badges[]`, `activeChallenges[]` |
| `healthScoreSlice` | Wellness | `healthScore` (0-100), `healthBreakdown`, `healthHistory[]` |
| `socialSlice` | Community | `posts[]`, `likedPostIds`, `postComments`, `joinedCommunities[]` |

**Persistence**: Manual hydration on app start + manual `persist()` after mutations. Storage key: `@credithalo_store`. See `docs/state-management.md` for slice details.

### Services (`src/services/`)

All external APIs have mock fallbacks — the app works fully offline:

| Service | Real API | Fallback |
|---------|----------|----------|
| `chatbot.js` | OpenAI GPT | Keyword-based mock responses |
| `goalAnalysis.js` | OpenAI | Local feasibility analysis |
| `auth.js` | Google Sign-In | Stub (needs expo-dev-client) |
| `plaid.js` | Plaid | Stub (needs expo-dev-client) |
| `mockTransactions.js` | — | Random transaction generator |
| `mockAccounts.js` | — | Static accounts + holdings |

Financial calculators: `budgetAnalysis.js`, `creditScoreSimulator.js`, `debtPayoffCalculator.js`, `subscriptionDetector.js`.

### Theme (`src/theme/`)

Dark theme with gold accents (app). White theme with gold accents (landing page).

- `colors.js` — palette: background `#1A1714`, primary gold `#D4A843`, glass overlays
- `tokens.js` — spacing, radii, shadows, blur levels, spring configs, typography scale
- `styles.js` — global style utilities

UI pattern: glassmorphism (blur + semi-transparent + gold borders).

### Components

**UI primitives** (`src/components/ui/`): `GradientBackground`, `GlassCard`, `GlassModal`, `AnimatedButton`, `AnimatedText`, `ProgressBar`, `PremiumTabBar`.

**Feature components**: `AngelMascot`, `StreakTracker`, `PostCard`, `GoalCard`, `ScoreRing`, `MiniBarChart`, `QuickStatCard`, `TransactionRow`, `InsightCard`, `SmartGoalCard`.

### Custom Hooks (`src/hooks/`)

- `useEntranceAnimation(delay)` — staggered fade-in + slide-up (Reanimated)
- `usePressAnimation()` — spring scale on press
- `useHaptic()` — expo-haptics wrapper

### Data (`src/data/`)

Mock data: `mockModules.js` (3 modules, 9 lessons), `mockPosts.js`, `mockCommunities.js`, `mockGoals.js`, `badges.js`, `savingsChallenges.js`.

## Environment Variables

### Mobile App (project root `.env`, optional)
- `EXPO_PUBLIC_OPENAI_API_KEY` — enables real AI chatbot
- `EXPO_PUBLIC_PLAID_CLIENT_ID` — enables real bank linking

### Landing Page (`landing/.env`, optional)
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anonymous key
- Falls back to local `landing/waitlist.json` if not set

## Landing Page

Standalone Node.js server in `landing/`. White background + gold accents, angelic theme. Features:
- Waitlist signup with Supabase backend (or local JSON fallback)
- API: `POST /api/waitlist`, `GET /api/waitlist/count`
- Animations: scroll-reveal, floating phone mockup, progress bars, parallax halo rings, staggered card entrances
- Messaging focused on community and changing the conversation around money
- See `docs/landing-page.md` for full documentation

## Key Dependencies

- `react-native-reanimated` — animations (babel plugin in `babel.config.js`)
- `expo-linear-gradient` / `expo-blur` — glassmorphism effects
- `react-native-gifted-charts` + `react-native-svg` — charts
- `zustand` + `@react-native-async-storage/async-storage` — state + persistence
- `openai` — AI chatbot
- `date-fns` — date utilities

## Documentation

See `docs/` folder:
- `architecture.md` — full system architecture with diagrams
- `landing-page.md` — landing page documentation, API, Supabase schema
- `screens-and-features.md` — every screen and feature reference
- `state-management.md` — deep dive into Zustand slices and persistence
- `environment-setup.md` — setup instructions, config files, platform notes

## Bundle IDs

- iOS: `com.credithalo.app`
- Android: `com.credithalo.app`
