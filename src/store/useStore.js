import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@credithalo_store';

const initialState = {
  user: null,
  isLoggedIn: false,
  bankLinked: false,
  streak: 0,
  lastStreakDate: null,
  completedLessons: [],
  goals: [],
  posts: [],
  likedPostIds: {},
  postComments: {},
  communities: [],
  joinedCommunities: [],
  alerts: [],
  notificationsEnabled: true,
};

export const useStore = create((set, get) => ({
  ...initialState,

  setUser: (user) => set({ user, isLoggedIn: !!user }),
  logout: () => set({ user: null, isLoggedIn: false }),
  setBankLinked: (linked) => set({ bankLinked: linked }),

  setStreak: (streak, lastStreakDate) => set({ streak, lastStreakDate }),
  incrementStreak: () => {
    const { lastStreakDate, streak } = get();
    const today = new Date().toDateString();
    if (lastStreakDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newStreak = lastStreakDate === yesterday.toDateString() ? streak + 1 : 1;
      set({ streak: newStreak, lastStreakDate: today });
      return newStreak;
    }
    return streak;
  },

  addCompletedLesson: (lessonId) =>
    set((state) => ({
      completedLessons: state.completedLessons.includes(lessonId)
        ? state.completedLessons
        : [...state.completedLessons, lessonId],
    })),

  addGoal: (goal) =>
    set((state) => ({
      goals: [...state.goals, { id: Date.now().toString(), text: goal, completed: false }],
    })),
  completeGoal: (id) =>
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    })),

  addPost: (post) =>
    set((state) => ({
      posts: [
        ...state.posts,
        {
          id: Date.now().toString(),
          ...post,
          likes: 0,
          comments: [],
          liked: false,
        },
      ],
    })),
  toggleLike: (id) =>
    set((state) => ({
      likedPostIds: {
        ...state.likedPostIds,
        [id]: !state.likedPostIds[id],
      },
    })),
  addComment: (id, comment) =>
    set((state) => ({
      postComments: {
        ...state.postComments,
        [id]: [...(state.postComments[id] || []), comment],
      },
    })),

  joinCommunity: (communityId) =>
    set((state) => ({
      joinedCommunities: state.joinedCommunities.includes(communityId)
        ? state.joinedCommunities
        : [...state.joinedCommunities, communityId],
    })),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [
        ...state.alerts,
        {
          id: Date.now().toString(),
          ...alert,
        },
      ],
    })),
  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),

  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          user: parsed.user ?? null,
          isLoggedIn: parsed.isLoggedIn ?? false,
          bankLinked: parsed.bankLinked ?? false,
          streak: parsed.streak ?? 0,
          lastStreakDate: parsed.lastStreakDate ?? null,
          completedLessons: parsed.completedLessons ?? [],
          goals: (parsed.goals ?? []).filter((g) => g && (g.text != null || g.content != null)).map((g) => ({
            id: g.id,
            text: g.text ?? g.content ?? '',
            completed: g.completed ?? false,
          })),
          posts: parsed.posts ?? [],
          likedPostIds: parsed.likedPostIds ?? {},
          postComments: parsed.postComments ?? {},
          joinedCommunities: parsed.joinedCommunities ?? [],
          alerts: parsed.alerts ?? [],
          notificationsEnabled: parsed.notificationsEnabled ?? true,
        });
      }
    } catch (e) {
      console.warn('Failed to hydrate store:', e);
    }
  },

  persist: async () => {
    const state = get();
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: state.user,
          isLoggedIn: state.isLoggedIn,
          bankLinked: state.bankLinked,
          streak: state.streak,
          lastStreakDate: state.lastStreakDate,
          completedLessons: state.completedLessons,
          goals: state.goals,
          posts: state.posts,
          likedPostIds: state.likedPostIds,
          postComments: state.postComments,
          joinedCommunities: state.joinedCommunities,
          alerts: state.alerts,
          notificationsEnabled: state.notificationsEnabled,
        })
      );
    } catch (e) {
      console.warn('Failed to persist store:', e);
    }
  },
}));
