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

**Important:** Use the **Expo Go app** to scan the QR code—not your phone's regular Camera app. The Camera app will show "no data to extract" because Expo QR codes use a special format.

1. Install **Expo Go** from the [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS) or [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android)
2. Ensure your phone and computer are on the same Wi‑Fi network
3. Run `npx expo start` and scan the QR code **inside the Expo Go app** (tap "Scan QR code" in Expo Go)

If scanning fails (e.g., different networks), run `npx expo start --tunnel` for a tunnel URL that works across networks.

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
