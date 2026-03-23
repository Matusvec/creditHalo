# Landing Page Documentation

## Overview

The landing page is a standalone waitlist website at `landing/`. It runs as a separate Node.js server, independent of the Expo mobile app.

## Stack

- **Server**: Plain Node.js HTTP server (`server.js`) — no Express
- **Frontend**: Single `index.html` file with inline CSS + JS (no build step)
- **Database**: Supabase (primary) with local JSON file fallback (`waitlist.json`)
- **Dependencies**: `@supabase/supabase-js`, `dotenv`

## Running

```bash
cd landing
npm install
npm start          # Runs on http://127.0.0.1:3456
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/waitlist` | Add email to waitlist |
| `GET` | `/api/waitlist/count` | Get total waitlist count |

### POST /api/waitlist

**Request**: `{ "email": "user@example.com" }`

**Responses**:
- `200`: `{ "message": "You're on the list! We'll be in touch." }`
- `400`: Invalid email
- `409`: Already on waitlist
- `500`: Server error

## Environment Variables

Create `landing/.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

If these are not set, the server falls back to storing emails in `landing/waitlist.json`.

## Design

- **Theme**: White background with gold accents — angelic/halo aesthetic
- **Logo**: "Credit" in dark text + "Halo" in gold
- **Layout**: Hero → Social proof → Stats → Features → Community → Goals → How it works → CTA → Footer
- **Animations**: Scroll-reveal, floating phone mockup, animated progress bars, staggered card entrances, parallax halo rings, counter animations

## Key Sections

1. **Hero**: Tagline "Changing the way we talk about money", waitlist form, halo ring decorations
2. **Phone Mockup**: Floating animated preview of the app dashboard
3. **Social Proof**: Avatar stack + waitlist count
4. **Stats Bar**: 10+ tools, 5 min lessons, 100% free
5. **Features Grid**: Community, Goal Setting, Lessons, AI Guide, Money Hub, Challenges
6. **Community Section**: Focus on open conversations, accountability, shared wins
7. **Goals Section**: Visual goal progress bars, AI insights, milestone tracking
8. **How It Works**: 4 steps — Create account, Set goals, Join community, Grow together
9. **CTA Section**: Bottom waitlist form with halo glow effect

## Supabase Table Schema

The `waitlist` table needs:

```sql
CREATE TABLE waitlist (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Note: The server inserts `email` only. The unique constraint handles duplicate detection (Postgres error code `23505`).
