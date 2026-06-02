# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ImpulseGuard is a NestJS backend server for a gamified impulse control mobile app. Users track impulses, complete sessions to earn rewards, raise virtual pets, fight bosses, and earn achievements.

## Common Commands

```bash
# Install dependencies
pnpm install

# Development (with hot reload)
pnpm run start:dev

# Build
pnpm run build

# Production
pnpm run start:prod

# Run all tests
pnpm run test

# Run single test file
pnpm run test -- path/to/file.spec.ts

# Run tests in watch mode
pnpm run test:watch

# E2E tests
pnpm run test:e2e

# Lint and fix
pnpm run lint

# Format code
pnpm run format
```

## Architecture

### Tech Stack
- **Framework**: NestJS 10 with TypeScript
- **Database**: MongoDB via Mongoose
- **Authentication**: Clerk (JWT verification via `@clerk/clerk-sdk-node`)
- **Push Notifications**: Expo Server SDK
- **Rate Limiting**: `@nestjs/throttler` (60 requests/minute)

### Authentication Flow
- Global `ClerkAuthGuard` protects all routes by default
- Use `@Public()` decorator to make endpoints public
- Use `@Dev()` decorator to restrict endpoints to development environment only
- Use `@UserDec()` parameter decorator to get the authenticated user payload (contains `clerkPayload`, `user`, and `id`)

### Module Structure
Each domain module follows NestJS conventions with:
- `*.module.ts` - Module definition
- `*.controller.ts` - HTTP endpoints
- `*.service.ts` - Business logic
- `schema/*.schema.ts` - Mongoose schemas
- `dto/*.dto.ts` - Data transfer objects
- `config/*.config.ts` - Static configuration (rewards, levels, items)

### Key Domain Modules
- **users** - User profiles, experience/levels, streaks, currency (glims)
- **impulses** - Impulse tracking and session completion with reward generation
- **pets** - Virtual pets with HP, energy, XP, friendship, and rarity tiers
- **bosses** - Boss battles where pets deal damage; rewards on defeat
- **eggs** - Hatchable eggs that become pets
- **items** - Consumable items (food, potions, toys, special)
- **achievements** - Achievement tracking and unlocking
- **statistics** - User progress analytics
- **notifications** - Push notification settings and delivery via Expo
- **rewards** - Configurable reward generation system (`RewardsModule.forRoot()`)

### Environment Configuration
Environment files follow pattern `.env.{NODE_ENV}.local` (e.g., `.env.development.local`).

Required variables:
- `MONGO_URL` - MongoDB connection string
- `CLERK_SECRET_KEY` - Clerk authentication secret
- `EXPO_TOKEN` - Expo push notification token

### Server Configuration
- Runs on port 4000
- CORS enabled for localhost:8000, localhost:8081, localhost:3000, and impulseguard.app
- Raw body parsing enabled for `/auth/webhooks` (Clerk webhooks)
