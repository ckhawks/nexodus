# Working with Claude Code on Nexodus

Tips and patterns learned while building Nexodus.

## File Organization

When adding documentation, guides, or educational content, create a dedicated folder:

```
guides/
├── ARCHITECTURE.md       # System design and patterns
├── DATABASE.md          # Database schema and queries
├── AUTHENTICATION.md    # Auth flow and session management
└── DEPLOYMENT.md        # Production deployment steps
```

This keeps the root directory clean and makes it easy to find learning materials without cluttering API documentation.

## Drizzle ORM Tips

### Schema Changes Generate Migrations Automatically

After modifying `src/db/schema.ts`, just run:
```bash
npm run db:generate
```

Drizzle Kit creates a SQL migration file that's safe to version control and deploy.

### Use Query Helpers for Reusable Operations

Instead of importing Drizzle in every file, create helpers in `src/db/queries.ts`:

```typescript
export async function getUserByEmail(email: string) {
  return await db.select().from(users).where(eq(users.email, email)).limit(1);
}
```

Then import the helper in your auth code. This centralizes logic and makes refactoring easier.

### Relations Enable Type-Safe Joins

Define relations in your schema:
```typescript
export const trackersRelations = relations(trackers, ({ one, many }) => ({
  user: one(users, { fields: [trackers.userId], references: [users.id] }),
  progressEntries: many(progress),
}));
```

This enables Drizzle to provide autocomplete for related queries.

## Authentication Patterns

### Always Validate Environment Variables at Startup

In `src/lib/env.ts`, check required env vars before the app starts. This catches configuration errors immediately rather than at runtime:

```typescript
if (!secretKey) {
  throw new Error("JWT_SECRET environment variable is not set");
}
```

### Enhance Session Validation

When retrieving sessions, verify the user still exists:

```typescript
const decrypted = await decrypt(session);
if (decrypted?.user?.id) {
  const userExists = await getUserByEmail(decrypted.user.email);
  if (!userExists) {
    (await cookies()).set("session", "", { expires: new Date(0) });
    return null;
  }
}
```

This prevents orphaned sessions for deleted accounts.

### Wrap Auth Operations in Try-Catch

Database errors should be caught gracefully:

```typescript
export async function register(prevState, formData) {
  try {
    // ... registration logic
  } catch (error) {
    console.error("Registration error:", error);
    return { message: "An error occurred during registration. Please try again." };
  }
}
```

## Component Patterns

### Use Native HTML Over UI Libraries

Building custom form components with native HTML is lightweight and gives you full control:

```tsx
<input
  id="email"
  type="email"
  name="email"
  style={{
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  }}
/>
```

When you need component libraries later (modals, dropdowns), consider lightweight alternatives like Radix UI or Headless UI rather than heavy frameworks.

### Keep Styles Modular

Use CSS Modules for component-specific styling:

```typescript
import styles from "./Component.module.scss";

<div className={styles.wrapper}>
  <button className={styles.button} />
</div>
```

This prevents style conflicts and makes refactoring easy.

### Icons and Emoji Policy

- **Frontend UI**: Use Lucide icons from the `lucide-react` package (already in `package.json`)
- **CLI logging/console**: Avoid emojis entirely - use plain text or ASCII characters
- **Never** use emoji in the frontend interface or CLI output

This keeps the UI professional and consistent, and ensures CLI logging is compatible with all terminals and log aggregation systems.

## Development Workflow

### Use Docker for Local PostgreSQL

Start the database with:
```bash
docker-compose up -d
```

Check status:
```bash
docker-compose ps
```

This ensures local and production environments use the same database engine (PostgreSQL 16).

### Environment Variable Strategy

- **`.env.local`** - Local development secrets (git-ignored)
- **`.env.example`** - Template for team setup
- **Never commit `.env` or secret files**

Example `.env.local`:
```
DATABASE_URL="postgresql://nexodus:password@localhost:5432/nexodus"
JWT_SECRET="dev-secret-change-in-production"
```

### Migrations are Safe to Version Control

Database migrations in `drizzle/migrations/` should be committed to git. They're SQL files that document schema evolution and can be replayed on any environment.

### Testing Changes Locally

Don't rebuild after every change. The dev server hot-reloads code changes automatically. Only run `npm run build` when:
- You expect build errors and want to catch them early
- You're about to commit and want to verify production build succeeds
- You've made TypeScript changes and want to verify types

For testing auth flows, feature changes, or UI tweaks, use the local dev server (`npm run dev`) which rebuilds much faster on file changes.

## Building for Production

### Always Build Locally First

Run `npm run build` before pushing:
```bash
npm run build
```

This catches type errors and build issues early. The output shows route sizes and which routes are static vs dynamic.

### Clean Up Unused Dependencies

Removing Bootstrap and FontAwesome saved ~200KB. Review `package.json` quarterly and remove unused packages.

## Git Workflow for Large Changes

When making major refactors (like migrating to Drizzle), commit by feature layer:

1. First commit: Add Drizzle infrastructure (schema, client, queries)
2. Second commit: Rewrite auth to use Drizzle
3. Third commit: Remove old database wrapper
4. Fourth commit: Update components and fix build errors

This makes it easier to review changes and revert individual layers if needed.

## Performance Considerations

### Database Indexes Matter

The schema includes indexes on frequently-queried columns:
```typescript
emailIdx: index("idx_user_email").on(table.email),
usernameIdx: index("idx_user_username").on(table.username),
```

Add indexes for columns you query frequently to avoid full table scans.

### Sessions Should Be Short-Lived

24-hour sessions are reasonable for most apps. For high-security operations, reduce to 1-2 hours and require re-authentication.

## Future Architecture Notes

- **Lucide Icons:** Already in `package.json` for when you need an icon library
- **Resend Email:** Infrastructure is set up; just call functions from `src/email/client.ts`
- **Docker for Prod:** Consider extending Docker setup to production (Docker image building)
- **Valkey/Redis:** Placeholder for real-time features; add when needed

## Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Test production build
npm run lint             # Check code quality

# Database
npm run db:generate      # Generate migrations from schema
npm run db:migrate       # Run pending migrations
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle visual explorer

# Docker
docker-compose up -d     # Start PostgreSQL
docker-compose down      # Stop PostgreSQL
docker-compose logs -f   # View PostgreSQL logs
```

---

**Last Updated:** Phase 8 - Complete migration to Next.js 15 + Drizzle + Custom UI
