# Tone Breath - Specifications Index

## Document Structure

| File | Description |
|------|-------------|
| [00-project-overview.md](./00-project-overview.md) | Vision, phases, and tech stack |
| [01-emotional-tracking.md](./01-emotional-tracking.md) | Radar chart system, dimensions, registration flow, data model |
| [02-diary-notes.md](./02-diary-notes.md) | Session-linked and free-form notes, calendar integration |
| [03-backend-architecture.md](./03-backend-architecture.md) | FastAPI + Supabase architecture, API endpoints, DB schema |

## Key Decisions Summary

### Adaptive Design
- **Mobile-first** with breakpoint-driven adaptive layouts
- **3 breakpoints**: Mobile (<768), Tablet (768-1023), Desktop (≥1024)
- **Desktop**: Centered 480px column, not a stretched layout
- **Core interaction** (breathing circle) is identical across all sizes
- Skills: `tailwindcss-mobile-first`, `tailwind-css-patterns`, `vercel-react-best-practices`

### Emotional Tracking
- **6 fixed dimensions**: Calma, Ansiedad, Energia, Tristeza, Enfoque, Apertura
- **Registration**: Before AND after each session (skip available)
- **UX**: 2-3 taps, auto-skip after 2 seconds
- **View**: Timeline + radar per day in calendar
- **Visual**: Hexagonal radar chart with spring animations

### Diary/Notes
- **Dual system**: Session-linked notes + independent free-form notes
- **Auto-context**: Session notes auto-populate with routine data + emotion delta
- **Search**: Full-text search in Spanish, tag-based filtering
- **Offline-first**: IndexedDB with Supabase sync

### Backend
- **Framework**: FastAPI (async Python)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (JWT)
- **Migrations**: Alembic
- **Validation**: Pydantic v2

## Open Questions

1. [ ] Binaural beat frequencies for Phase 4
2. [ ] Export format preferences (JSON, CSV, PDF?)
3. [ ] Notification strategy for daily check-ins
4. [ ] Data retention policy
5. [ ] Multi-language support (Spanish default?)
