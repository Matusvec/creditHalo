# Credit Halo - Architecture Documentation

## Overview

Credit Halo is a gamified financial wellness mobile application built with React Native + Expo SDK 54. The app combines financial education, community features, goal tracking, and AI-powered guidance into a single mobile experience. Written entirely in JavaScript (no TypeScript).

## System Architecture

```
┌──────────────────────────────────────────────────────┐
│                    App.js (Entry)                     │
│              Hydrates store → Renders app             │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              AppNavigator (React Navigation)          │
│  Root Stack → Bottom Tabs → Nested Stacks            │
└──────────────────────┬───────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐   ┌─────▼─────┐  ┌────▼────┐
   │ Screens │   │Components │  │  Hooks  │
   │ (views) │   │   (UI)    │  │(shared) │
   └────┬────┘   └───────────┘  └─────────┘
        │
   ┌────▼──────────────────────────────────┐
   │         Zustand Store (useStore)       │
   │   7 slices + AsyncStorage persistence │
   └────┬──────────────────────────────────┘
        │
   ┌────▼──────────────────────────────────┐
   │            Services Layer             │
   │  OpenAI, Plaid, Financial Calculators │
   │     (all with mock fallbacks)         │
   └───────────────────────────────────────┘
```

## Navigation Structure

```
Root Stack Navigator
├── LoadingScreen (auth/onboarding entry)
├── Main (Bottom Tab Navigator)
│   ├── DashboardTab → DashboardScreen
│   ├── MoneyTab → Stack Navigator
│   │   ├── MoneyHubScreen
│   │   ├── SpendingScreen
│   │   ├── BudgetScreen
│   │   ├── AccountsScreen
│   │   ├── InvestmentsScreen
│   │   ├── SubscriptionsScreen
│   │   ├── BillCalendarScreen
│   │   ├── CreditScoreSimScreen
│   │   └── DebtPayoffScreen
│   ├── LearnTab → LearnScreen
│   ├── CommunityTab → CommunityScreen
│   └── GoalsTab → Stack Navigator
│       ├── GoalsHubScreen
│       ├── GoalDetailScreen
│       └── SavingsChallengesScreen
├── LessonDetail (modal presentation)
├── Settings (modal)
├── HealthScore (full screen)
├── Achievements (full screen)
└── Chatbot (full screen modal)
```

The custom `PremiumTabBar` component replaces the default tab bar with a glassmorphic design using `expo-blur`.

## State Management

### Store Architecture

Zustand store with a slice pattern. Each slice manages a feature domain:

| Slice | Purpose | Key State |
|-------|---------|-----------|
| `authSlice` | Authentication | `user`, `isLoggedIn`, `bankLinked` |
| `educationSlice` | Learning progress | `streak`, `lastStreakDate`, `completedLessons` |
| `financeSlice` | Financial data | `transactions`, `budgets`, `subscriptions`, `accounts`, `holdings`, `bills` |
| `goalsSlice` | Goal management | `goals[]` with milestones and AI analysis |
| `gamificationSlice` | XP & rewards | `xp`, `level`, `badges[]`, `activeChallenges[]` |
| `healthScoreSlice` | Wellness metric | `healthScore` (0-100), `healthBreakdown`, `healthHistory[]` |
| `socialSlice` | Community | `posts[]`, `likedPostIds`, `postComments`, `joinedCommunities[]` |

### Persistence

- Storage key: `@credithalo_store`
- Manual hydration on app start in `App.js`
- Manual `persist()` calls after state mutations
- Uses `@react-native-async-storage/async-storage`

### XP Reward System

| Action | XP |
|--------|-----|
| Complete lesson | +50 |
| Set a goal | +20 |
| Complete goal | +100 |
| Set budget | +30 |
| Daily check-in | +10 |
| Community post | +15 |
| 7-day streak | +75 |
| Challenge milestone | +40 |

### Health Score Calculation (0-100)

| Component | Max Points | How Calculated |
|-----------|------------|----------------|
| Spending Habits | 20 | Month-over-month stability |
| Savings Rate | 20 | Income vs savings ratio |
| Debt Ratio | 20 | Debt-to-income ratio |
| Goal Completion | 15 | Completed / total goals |
| Education Progress | 15 | Completed lessons / 9 total |
| Budget Adherence | 10 | Active budgets count |

## Services Layer

All external integrations use a "mock-first" pattern — they work without API keys using local mock data.

| Service | Real Integration | Mock Fallback |
|---------|-----------------|---------------|
| `chatbot.js` | OpenAI GPT | Keyword-based responses by topic |
| `auth.js` | Google Sign-In | Stub (needs expo-dev-client) |
| `plaid.js` | Plaid API | Stub (needs expo-dev-client) |
| `mockTransactions.js` | — | Random transaction generator |
| `mockAccounts.js` | — | Static bank accounts + holdings |

### Financial Calculators

- `budgetAnalysis.js` — Budget recommendations and spending analysis
- `goalAnalysis.js` — AI-powered goal feasibility analysis (OpenAI or local)
- `creditScoreSimulator.js` — Simulates credit score changes from actions
- `debtPayoffCalculator.js` — Debt repayment timeline (snowball/avalanche)
- `subscriptionDetector.js` — Identifies recurring charges in transactions

## Theme & Design System

### Color Palette (Dark + Gold)

- Background: `#1A1714` (dark brown-black)
- Surface: `#2E2A24`
- Primary: `#D4A843` (gold)
- Primary Light: `#E8C96A`
- Text: `#F5F0E8` (cream)
- Glass: `rgba(255, 248, 230, 0.08)`

### Design Tokens (`src/theme/tokens.js`)

- **Spacing**: xs(4), sm(8), md(12), lg(16), xl(24), xxl(48)
- **Radii**: sm(8), md(12), lg(16), xl(24), round(9999)
- **Blur**: light(20), medium(40), heavy(60), tabBar(80)
- **Typography**: largeTitle, title, headline, body, callout, caption, small
- **Springs**: entrance, press, modal, bounce (Reanimated configs)

### Glassmorphism Pattern

The app heavily uses blur + semi-transparent overlays. Components like `GlassCard` and `GlassModal` combine `expo-blur` with gold-tinted borders for the signature look.

## Custom Hooks

| Hook | Purpose | Uses |
|------|---------|------|
| `useEntranceAnimation(delayMs)` | Staggered fade-in + slide-up | Reanimated shared values + springs |
| `usePressAnimation()` | Button press scale feedback | Reanimated spring animation |
| `useHaptic()` | Haptic feedback trigger | expo-haptics |

## Data Layer

Mock data in `src/data/`:
- `mockModules.js` — 3 course modules with 3 lessons each (9 total lessons)
- `mockPosts.js` — Social feed sample posts
- `mockCommunities.js` — Community group definitions
- `mockGoals.js` — Default financial goal templates
- `badges.js` — Achievement definitions (unlock conditions)
- `savingsChallenges.js` — Challenge templates (52-week, no-spend, etc.)
