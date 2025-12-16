import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Initialize Drizzle ORM with postgres-js driver
 * Works with local Docker PostgreSQL and self-hosted instances
 */
const queryClient = postgres(
  process.env.DATABASE_URL || "postgresql://nexodus:nexodus_dev_password@localhost:5432/nexodus"
);

const db = drizzle(queryClient, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

export default db;
