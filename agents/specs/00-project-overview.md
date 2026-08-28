# Tone Breath - Project Overview

## Vision

Tone Breath is a PWA for mindfulness and guided breathing exercises. The app eliminates the friction of downloading an app by running directly in the browser with offline capabilities.

## Phases

### Phase 1: MVP (Breathing Guide)
- PWA with React + Vite + Tailwind + Framer Motion + Tone.js
- 3 breathing routines: Square (4-4-4-4), 4-7-8, Coherent (5.5-5.5)
- Central breathing circle with 60fps animations synchronized to 60 BPM
- Procedural audio synthesis (no mp3 files)
- Empathetic, minimalist UI with light/dark mode
- 4 core screens: Home, Time Selector, Active Session, Session Summary

### Phase 2: Backend + Emotional Tracking
- FastAPI + Supabase backend
- User authentication (JWT)
- Session history and user analytics
- **Emotional Tracking System** (radar/spider chart)
- **Diary/Notes System** (session-linked + free-form)
- Emotional calendar with timeline + radar view

### Phase 3: Personalized Recommendations
- Adaptive breathing routines based on user history
- Dynamic tone, timbre, and duration adjustments
- Pattern learning per user profile

### Phase 4: Binaural Sounds
- Procedural binaural beat generation
- Per-user adaptation based on measurable response
- Integration with existing routines

## Responsive / Adaptive Strategy

The app is **mobile-first by design**. Desktop is not the primary use case, but the experience should not be hostile.

### Approach: Adaptive Layouts

Rather than fully fluid responsive design, we use **breakpoint-driven adaptive layouts** — distinct layouts per device class while maintaining the same core interaction.

| Breakpoint | Target | Behavior |
|------------|--------|----------|
| **Mobile** (<768px) | Phones | Default layout, full screen, bottom navigation |
| **Tablet** (768-1023px) | Tablets | Same UX, larger breathing circle, wider cards |
| **Desktop** (≥1024px) | Laptops/Desktops | Centered column (max-w-[480px]), dark background fills viewport |

### Design Rationale

The core of the app is a **centered breathing circle** — this interaction is inherently intimate and works identically at any screen size. The only difference is how much "breathing room" exists around it.

- **Mobile**: Full screen immersion. Bottom nav, tight spacing.
- **Tablet**: Same mobile layout scaled up. No new UI elements.
- **Desktop**: Content constrained to 480px centered column. Background extends to fill. The "intimate mobile experience" is preserved by design, not as a limitation.

### Tailwind Utilities

- Base styles: unprefixed (mobile default)
- Tablet: `md:` prefix (768px+)
- Desktop: `lg:` prefix (1024px+)
- Centering: `mx-auto max-w-[480px] lg:max-w-[480px]`

### Skills for Implementation

- `tailwindcss-mobile-first` — Breakpoint strategy, safe areas, touch targets
- `tailwind-css-patterns` — Layouts, grids, component patterns
- `vercel-react-best-practices` — React performance (avoid unnecessary re-renders during animations)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, Framer Motion |
| Audio | Tone.js (Web Audio API) |
| Backend | Python, FastAPI |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT) |
| Deployment | PWA (no app store) |
