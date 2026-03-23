# State Management Deep Dive

## Store Structure

The Zustand store is defined in `src/store/useStore.js` and composed from 7 slices in `src/store/slices/`.

Usage in components:
```js
import { useStore } from '../store/useStore';

// In component:
const { user, xp, goals, addXP } = useStore();
```

## Persistence Flow

1. **App.js** calls `hydrateStore()` on mount
2. `hydrateStore()` reads `@credithalo_store` from AsyncStorage
3. Store state is merged with defaults
4. After any mutation, call `persist()` to save back to AsyncStorage

**Important**: Persistence is manual, not automatic. If you add a new action that modifies state, ensure `persist()` is called after the mutation, or the change will be lost on app restart.

## Slice Details

### authSlice
```js
{
  user: null,           // { name, email, avatar }
  isLoggedIn: false,
  bankLinked: false,
}
// Actions: setUser(user), logout(), setBankLinked(bool)
```

### educationSlice
```js
{
  streak: 0,
  lastStreakDate: null,    // ISO date string
  completedLessons: [],    // lesson IDs
}
// Actions: setStreak(n), incrementStreak(), addCompletedLesson(id)
```

### financeSlice
```js
{
  transactions: [],
  budgets: {},              // { category: amount }
  budgetMonth: null,        // "YYYY-MM"
  subscriptions: [],
  cancelledSubscriptions: [],
  accounts: [],
  holdings: [],
  netWorthHistory: [],
  bills: [],
}
// Actions: setTransactions(), setBudget(), setSubscriptions(),
//          cancelSubscription(), addBill(), markBillPaid(), etc.
```

### goalsSlice
```js
{
  goals: [],
  completedGoalCount: 0,
}
// Goal shape:
// { id, text, completed, targetAmount, currentAmount, deadline,
//   category, aiAnalysis, milestones[], createdAt }
//
// Actions: addGoal(), completeGoal(), updateGoalProgress(),
//          setGoalAIAnalysis(), addGoalMilestone(), markMilestoneReached()
```

Note: Goals have a legacy `content` field that maps to `text` for backward compatibility.

### gamificationSlice
```js
{
  xp: 0,
  level: 1,
  badges: [],              // badge IDs
  activeChallenges: [],
  completedChallenges: [],
}
// Actions: addXP(amount), earnBadge(id), startChallenge(challenge),
//          updateChallengeProgress(id, progress), completeChallenge(id)
```

### healthScoreSlice
```js
{
  healthScore: 0,          // 0-100
  healthBreakdown: {},     // { category: score }
  healthHistory: [],       // [{ date, score }]
}
// Actions: calculateHealthScore(), updateHealthScoreWithData(data),
//          recordHealthSnapshot()
```

### socialSlice
```js
{
  posts: [],
  likedPostIds: {},        // { postId: true }
  postComments: {},        // { postId: [comments] }
  joinedCommunities: [],   // community IDs
}
// Actions: addPost(), likePost(), unlikePost(), addComment(),
//          joinCommunity(), leaveCommunity()
```
