# Credit Halo

A gamified credit education and financial habit-building mobile app built with React Native and Expo.

## Features

- **Loading/Onboarding**: Warm yellow/gold theme with angel mascot, Google sign-in (stub)
- **Home**: Welcome banner, link bank account (Plaid stub), tab navigation
- **Learn**: Streak tracker, progress bar ("Earn Your Wings"), modules with lessons and quizzes
- **Community**: Post milestones, find friends, join communities, like and comment
- **Goals**: Set goals, complete with celebration, angel chatbot for advice
- **Insights**: Request analysis (stub), loan calculator, budget tool, set up alerts
- **Settings**: Profile, link bank, notifications toggle, legal links

## Setup

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or Camera (iOS) to run on device.

## Configuration (Optional)

- **OpenAI**: Set `EXPO_PUBLIC_OPENAI_API_KEY` for real chatbot responses
- **Plaid**: Set `EXPO_PUBLIC_PLAID_CLIENT_ID` for real bank linking (requires expo-dev-client)
- **Google Sign-In**: Configure `@react-native-google-signin/google-signin` for real auth (requires expo-dev-client)

Without these, the app uses mock/stub implementations.

## Tech Stack

- Expo SDK 52
- React Navigation (stack + bottom tabs)
- Zustand + AsyncStorage for state
- react-native-svg for angel mascot
- react-native-confetti-cannon for goal completion
- react-native-elements for UI components
