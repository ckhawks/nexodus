/**
 * Database query helpers using Drizzle ORM
 * These functions abstract database operations for the auth system
 */

import db from "./client";
import { users } from "./schema";
import { eq, ilike } from "drizzle-orm";

/**
 * Find a user by email
 */
export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0] || null;
}

/**
 * Find a user by username (case-insensitive)
 */
export async function getUserByUsername(username: string) {
  const result = await db
    .select()
    .from(users)
    .where(ilike(users.username, username))
    .limit(1);
  return result[0] || null;
}

/**
 * Find a user by username (case-insensitive) - selects all columns for auth
 */
export async function getUserByUsernameWithPassword(username: string) {
  const result = await db
    .select()
    .from(users)
    .where(ilike(users.username, username))
    .limit(1);
  return result[0] || null;
}

/**
 * Create a new user
 */
export async function createUser(
  username: string,
  email: string,
  hashedPassword: string
) {
  const result = await db
    .insert(users)
    .values({
      username,
      email,
      password: hashedPassword,
    })
    .returning();
  return result[0] || null;
}

/**
 * Check if user exists by email
 */
export async function userExistsByEmail(email: string): Promise<boolean> {
  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result.length > 0;
}

/**
 * Check if user exists by username (case-insensitive)
 */
export async function userExistsByUsername(username: string): Promise<boolean> {
  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(ilike(users.username, username))
    .limit(1);
  return result.length > 0;
}
