# Local Development Setup

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for local PostgreSQL)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start PostgreSQL

```bash
docker-compose up -d
```

PostgreSQL 16 runs on `localhost:5432`:
- Username: `nexodus`
- Password: `nexodus_dev_password`
- Database: `nexodus`

Verify it's running:
```bash
docker-compose ps
```

### 3. Apply Database Migrations

```bash
npm run db:push
```

This creates the `users` table with proper indexes.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `.env.local`:

```
DATABASE_URL="postgresql://nexodus:nexodus_dev_password@localhost:5432/nexodus"
JWT_SECRET="dev-secret-change-in-production"
RESEND_API_KEY="re_test_..." (optional)
RESEND_FROM_EMAIL="onboarding@resend.dev" (optional)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

See `.env.example` for reference.

## Database Management

### Generate Migration After Schema Changes

After modifying `src/db/schema.ts`:

```bash
npm run db:generate
```

This creates a migration file in `drizzle/migrations/`.

### Apply Migrations

```bash
npm run db:push
```

### Explore Database Visually

```bash
npm run db:studio
```

Opens a web UI for browsing and editing your database.

## Database Access

### Query via CLI

```bash
docker-compose exec -T postgres psql -U nexodus -d nexodus
```

Then:
```sql
SELECT * FROM users;
\dt  -- list all tables
```

### View Logs

```bash
docker-compose logs -f postgres
```

## Testing Authentication

1. Go to [http://localhost:3000/register](http://localhost:3000/register)
2. Create an account
3. You'll be logged in automatically (24-hour session)
4. Click your username to logout

## Troubleshooting

**"Database connection refused"**
- Check Docker is running: `docker-compose ps`
- Restart container: `docker-compose down && docker-compose up -d`

**"relation users does not exist"**
- Run migrations: `npm run db:push`
- Check `.env.local` DATABASE_URL points to local database (not `.env.development.local`)

**"Cannot find module '@/db/schema'"**
- Run `npm install`
- Check `tsconfig.json` has `@/*` path alias

## Production Deployment

1. Set `DATABASE_URL` to your VPS PostgreSQL connection string
2. Set `JWT_SECRET` to a strong random value
3. Run: `npm run db:push`
4. Deploy: `npm run build && npm start`
