# Nexodus

A minimalist interactive game where players gather, craft, and trade resources while shaping their unique virtual experience.

## Tech Stack

- **Frontend:** Next.js 15, React, TypeScript, CSS Modules (SCSS)
- **Backend:** Next.js Server Actions, API Routes
- **Database:** PostgreSQL 16, Drizzle ORM
- **Auth:** JWT in HTTP-only cookies, bcrypt password hashing
- **Icons:** Lucide React
- **Deployment:** Self-hosted VPS (PostgreSQL), Next.js (Vercel or custom)

## Quick Start

See [guides/SETUP.md](guides/SETUP.md) for detailed local development setup.

```bash
npm install
docker-compose up -d
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/              # Next.js App Router (pages, layouts, API routes)
├── auth/             # Authentication (JWT, password hashing)
├── components/       # React components
├── db/
│   ├── schema.ts     # Drizzle ORM schema
│   ├── client.ts     # Database client
│   └── queries.ts    # Query helpers
├── lib/              # Utilities
└── email/            # Email templates (future)

guides/
├── SETUP.md          # Local development setup
└── SCALABILITY.md    # Code quality and scaling considerations

drizzle/
└── migrations/       # Auto-generated SQL migrations
```

## Database Schema

### Users Table
- `id` (uuid, primary key)
- `username` (varchar, unique, indexed)
- `email` (varchar, unique, indexed)
- `password` (varchar, bcrypt hashed)
- `created_at` (timestamp)

## Development

- **Dev Server:** `npm run dev` (hot-reload on changes)
- **Build:** `npm run build` (only before committing or expecting errors)
- **Lint:** `npm run lint`
- **Database:** See [guides/SETUP.md](guides/SETUP.md)

## Documentation

- **For you (Claude):** See [CLAUDE.md](CLAUDE.md) for patterns and tips
- **Setup & troubleshooting:** See [guides/SETUP.md](guides/SETUP.md)
- **Scaling & code quality:** See [guides/SCALABILITY.md](guides/SCALABILITY.md)
