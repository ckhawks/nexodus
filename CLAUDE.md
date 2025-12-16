# Working with Claude Code on Nexodus

Tips and patterns learned while building Nexodus.

## Drizzle ORM Tips

### Migrations: Use `db:generate` + `db:push`

```bash
npm run db:generate  # Creates SQL diff
npm run db:push      # Applies to database
```

**Don't use `db:migrate`** in development after running `db:push` - it replays all migrations and fails on existing tables.

### Query Helpers

Create reusable functions in `src/db/queries.ts`:
```typescript
export async function getUserByEmail(email: string) {
  return await db.select().from(users).where(eq(users.email, email)).limit(1);
}
```

### Relations for Type-Safe Joins

```typescript
export const trackersRelations = relations(trackers, ({ one, many }) => ({
  user: one(users, { fields: [trackers.userId], references: [users.id] }),
  progressEntries: many(progress),
}));
```

### CRITICAL: Always Use `eq()` for WHERE Clauses

```typescript
// WRONG - Returns boolean, no filtering!
.where((bt) => bt.name === "stone_quarry")

// CORRECT
.where(eq(buildingTypes.name, "stone_quarry"))
```

Arrow functions in `.where()` return booleans, not SQL. Drizzle treats truthy booleans as "no WHERE" clause, selecting ALL rows. This caused the building seeding to assign all costs/production to the first building (Resource Dispenser).

## Authentication Patterns

### Always Validate Environment Variables at Startup

In `src/lib/env.ts`, check required env vars before the app starts. This catches configuration errors immediately rather than at runtime:

```typescript
if (!secretKey) {
  throw new Error("JWT_SECRET environment variable is not set");
}
```

### Session Validation

Check user existence by ID only (JWT already has user data):
```typescript
export async function userExistsById(userId: string): Promise<boolean> {
  const result = await db.select({ id: users.id }).from(users)
    .where(eq(users.id, userId)).limit(1);
  return result.length > 0;
}
```

Prevents orphaned sessions from deleted accounts efficiently.

### Wrap Auth Operations in Try-Catch

```typescript
export async function register(prevState, formData) {
  try {
    // registration logic
  } catch (error) {
    console.error("Registration error:", error);
    return { message: "An error occurred during registration." };
  }
}
```

## Component Patterns

### Use Native HTML Over UI Libraries

Build custom form components with native HTML - it's lightweight and gives full control. Use Radix UI or Headless UI when needed.

### Keep Styles Modular

Use CSS Modules:
```typescript
import styles from "./Component.module.scss";
<div className={styles.wrapper}><button className={styles.button} /></div>
```

### Icons & Emoji

- **Frontend UI**: Use Lucide icons (`lucide-react`)
- **CLI logging**: Avoid emojis - use plain text

## Design System

**Visual Style:** Vercel/shadcn-inspired - black and white with strategic accent colors. Minimal gradients/shadows, subtle borders, clean typography.

**Theme System:** Custom light/dark using CSS variables (`src/app/globals.scss`).

**CSS Variables:**
- **Backgrounds:** `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- **Text:** `--text-primary`, `--text-secondary`, `--text-tertiary`
- **Borders:** `--border-color`, `--border-hover`
- **Accents:** `--accent-success-bg`, `--accent-error-bg`, etc.
- **Shadows:** `--shadow-sm`, `--shadow-md`

Always use CSS variables, never hard-coded colors.

## State Management

### Event-Driven Updates (Preferred)

Update only when something changes, not via polling:
```tsx
const handleHarvestComplete = () => {
  setRefreshTrigger(prev => prev + 1);
};
return <>
  <Harvester onHarvestComplete={handleHarvestComplete} />
  <ResourceInventory key={refreshTrigger} />
</>;
```

**Better than polling:** Immediate updates, no unnecessary requests, no loading flashes.

### Prevent Flash States

Only show loading on first load, not on refreshes:
```tsx
const isFirstLoad = inventory.length === 0;
if (isFirstLoad) setLoading(true);
const result = await getInventory();
if (result.success) setInventory(result.inventory);
if (isFirstLoad) setLoading(false);
```

## Development Workflow

**Docker:** `docker-compose up -d` to start PostgreSQL locally.

**Environment variables:** Use `.env.local` (git-ignored), never commit secrets.

**Testing locally:** Use `npm run dev` for hot-reloading. Only run `npm run build` before commits to catch build errors.

**Migrations:** Commit the SQL files in `drizzle/migrations/` - they document schema evolution.

## Building for Production

Run `npm run build` before pushing to catch type errors early. Output shows route sizes and static vs dynamic routes.

## Git Workflow

For major refactors, commit by feature layer so changes are reviewable and reversible.

## Performance

**Database indexes:** Add indexes on frequently-queried columns.
```typescript
emailIdx: index("idx_user_email").on(table.email),
```

**Session lifetime:** 24 hours is reasonable; reduce to 1-2 hours for high-security operations.

## Quick Commands

```bash
npm run dev              # Start dev server
npm run build            # Test production build
npm run db:generate      # Generate migrations
npm run db:push          # Apply to database
npm run db:studio        # Open Drizzle visual explorer
docker-compose up -d     # Start PostgreSQL
```
