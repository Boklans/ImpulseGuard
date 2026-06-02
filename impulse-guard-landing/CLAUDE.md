# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ImpulseGuard landing page - a Next.js 14 marketing website for an impulse management app. Built with TypeScript, Tailwind CSS, and supports 9 languages.

## Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Run production server
npm run lint     # Run Next.js linter
```

## Architecture

### Tech Stack
- **Framework:** Next.js 14 with App Router, React 18, TypeScript (strict mode)
- **Styling:** Tailwind CSS with tailwindcss-animate plugin
- **UI Components:** Radix UI primitives via shadcn/ui pattern
- **Animation:** GSAP with ScrollTrigger and other plugins
- **i18n:** Paraglide-Next (9 languages: EN, CN, DE, ES, FR, IT, JA, RU, UA)
- **Analytics:** PostHog + Google Analytics

### Key Directories
- `src/app/` - Next.js App Router pages (main landing at `page.tsx`, docs at `docs/`)
- `src/components/` - React components (page sections + `ui/` for Radix primitives)
- `src/components/ui/` - Shadcn/Radix UI components (button, dialog, toast, etc.)
- `src/lib/` - Utilities (`utils.ts` for `cn()` class merging, `i18n.ts` for routing)
- `src/paraglide/` - Auto-generated i18n runtime (do not edit manually)
- `translations/` - i18n message files (JSON per language)

### Provider Pattern
The app wraps content with multiple providers in this order:
1. `LanguageProvider` (Paraglide i18n)
2. `TooltipProvider` (Radix UI)
3. `PHProvider` (PostHog analytics)
4. `GsapProvider` (GSAP plugin registration - used in page.tsx)

### Internationalization
- Message files: `translations/{lang}.json`
- Usage: `import * as m from "@/paraglide/messages"` then `m.messageKey()`
- When adding new text, add translations to all 9 language files
- Middleware handles language routing with URL prefix strategy

### GSAP Animation
GSAP plugins are registered in `GsapProvider.tsx`. Use GSAP for scroll-triggered animations and smooth scrolling. Example scroll-to usage in Navbar:
```tsx
gsap.to(window, { duration: 1, scrollTo: "#section_id" })
```

### Component Patterns
- Page sections are separate components (Hero, HowItWorks, Tools, etc.)
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- Main page (`src/app/page.tsx`) is a client component for GSAP support

## Deployment

- Docker-based deployment via GitHub Actions
- Push to `master` triggers CI/CD pipeline
- Deploys to DigitalOcean droplet

## Environment Variables

Required for full functionality:
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog API key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host URL
