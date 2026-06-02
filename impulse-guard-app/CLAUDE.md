# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ImpulseGuard is a React Native mobile app built with Expo that helps users manage impulses through gamification. Users complete mindfulness sessions, track progress, and collect/hatch virtual pets as rewards.

## Development Commands

```bash
# Start development server
npx expo start

# Run on specific platforms
npm run ios          # expo run:ios
npm run android      # expo run:android
npm run web          # expo start --web

# Testing and linting
npm test             # jest --watchAll
npm run lint         # expo lint

# EAS builds
eas build --platform ios --profile development
eas build --platform ios --profile production
```

## Architecture

### Navigation Structure (Expo Router file-based routing)
- `app/_layout.tsx` - Root layout with Clerk auth, Redux, React Query providers
- `app/(auth)/` - Sign in/up screens (unauthenticated)
- `app/(onboarding)/` - New user flow (slideshow, name, impulse selection)
- `app/(tabs)/` - Main authenticated app with 4 tabs:
  - `(task-flow)` - Tasks, notes, stats screens
  - `(impulses-flow)` - Main impulse/session flow
  - `(pets-flow)` - Pets, eggs, items management
  - `(settings-flow)` - Settings, profile, notifications

### State Management
**Redux** (`redux/store.ts`): User state only - token, user object, session rewards
**React Query**: All server state (pets, impulses, tasks, eggs, notes, stats)

### API Pattern
Two API client approaches exist:
1. `utils/api.ts` - `createApiClient(getToken)` - Clerk-authenticated axios instance, used via `useApi()` hook
2. `utils/client.ts` - Redux-token-based axios client (legacy, less used)

Prefer the `useApi()` hook pattern for new code.

### Custom Hooks (`hooks/`)
Each entity has a corresponding hook using React Query:
- `useImpulses.ts` - Impulse sessions (infinite query + finish mutation)
- `usePets.ts` - Pet collection (infinite query + update mutation)
- `useEggs.ts` - Egg hatching
- `useTasks.ts`, `useNotes.ts` - Productivity features
- `useStats.ts` - User statistics
- `useUser.ts` - User operations (streak goals, notifications)

### Authentication
Clerk handles auth via `@clerk/clerk-expo`. Token stored in secure storage via `tokenCache`. Check auth state with `useAuth()` from Clerk.

### In-App Purchases
RevenueCat (`react-native-purchases`) handles subscriptions. Initialized in root layout, skipped in Expo Go.

### Configuration
- `constants/Config.ts` - API base URL, game asset maps (images, achievements, rewards)
- `app.config.js` - Expo config with Clerk key
- `eas.json` - Build profiles (development, production)

### Components
- `components/modals/` - Global modals (PayWall, Shop, LevelUp, NewAchievement)
- `components/ui/` - Reusable UI components
- `components/navigation/Header.tsx` - Main header with user info

### Key Flows
1. **Session Flow**: User feels impulse -> selects activity -> timer/session -> reports success/failure -> rewards
2. **Pet System**: Eggs hatch into pets -> feed/play to maintain -> pets can die if neglected
3. **Gamification**: XP, levels, achievements, streaks, in-app currency (glims)
