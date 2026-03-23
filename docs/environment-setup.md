# Environment Setup

## Prerequisites

- Node.js 18+
- pnpm (package manager used for the mobile app)
- npm (used for the landing page)
- Expo Go app on your phone (for mobile development)

## Mobile App Setup

```bash
# From project root
pnpm install
npm start                  # LAN mode (phone must be on same Wi-Fi)
npm run start:tunnel       # Tunnel mode via ngrok (use if LAN fails)
```

Scan the QR code with **Expo Go** (not your phone camera).

## Landing Page Setup

```bash
cd landing
npm install
npm start                  # Runs on http://127.0.0.1:3456
```

## Environment Variables

### Mobile App

Create `.env` in project root (optional — app works without these):

```
EXPO_PUBLIC_OPENAI_API_KEY=sk-...    # Enables real AI chatbot
EXPO_PUBLIC_PLAID_CLIENT_ID=...      # Enables real bank linking
```

Without these keys, the app uses built-in mock data and keyword-based chatbot responses.

### Landing Page

Create `landing/.env` (optional — falls back to local JSON file):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Platform-Specific Builds

```bash
npm run android            # expo run:android (requires Android SDK)
npm run ios                # expo run:ios (requires Xcode, macOS only)
npm run web                # expo start --web
```

## Key Config Files

| File | Purpose |
|------|---------|
| `app.json` | Expo config (name, icons, splash, bundle IDs) |
| `babel.config.js` | Babel preset + `react-native-reanimated/plugin` |
| `package.json` | Dependencies and scripts |
| `pnpm-lock.yaml` | Lockfile |

## Bundle Identifiers

- iOS: `com.credithalo.app`
- Android: `com.credithalo.app`

## Notes

- App orientation is locked to **portrait**
- User interface style is set to **dark**
- `react-native-reanimated` requires its Babel plugin — this is already configured in `babel.config.js`
- Google Sign-In and Plaid require a **development build** (`expo-dev-client`), not Expo Go
