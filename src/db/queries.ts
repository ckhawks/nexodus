/**
 * Database query helpers using Drizzle ORM
 * These functions abstract database operations for the auth system and game resources
 */

import db from "./client";
import {
  users,
  resourceTypes,
  userInventories,
  generatorCooldowns,
} from "./schema";
import { eq, ilike, and, sql } from "drizzle-orm";

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

/**
 * Check if user exists by ID (optimized for session validation)
 */
export async function userExistsById(userId: string): Promise<boolean> {
  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return result.length > 0;
}

// ============================================================================
// RESOURCE QUERIES
// ============================================================================

/**
 * Get all resource types
 */
export async function getAllResourceTypes() {
  return await db.select().from(resourceTypes).orderBy(resourceTypes.tier);
}

/**
 * Get resource type by name
 */
export async function getResourceTypeByName(name: string) {
  const result = await db
    .select()
    .from(resourceTypes)
    .where(eq(resourceTypes.name, name))
    .limit(1);
  return result[0] || null;
}

/**
 * Get user's inventory for all resources
 */
export async function getUserInventory(userId: string) {
  return await db
    .select({
      id: userInventories.id,
      quantity: userInventories.quantity,
      updated_at: userInventories.updated_at,
      resource: {
        id: resourceTypes.id,
        name: resourceTypes.name,
        display_name: resourceTypes.display_name,
        description: resourceTypes.description,
        tier: resourceTypes.tier,
        icon: resourceTypes.icon,
      },
    })
    .from(userInventories)
    .innerJoin(
      resourceTypes,
      eq(userInventories.resource_type_id, resourceTypes.id)
    )
    .where(eq(userInventories.user_id, userId))
    .orderBy(resourceTypes.tier, resourceTypes.name);
}

/**
 * Get user's quantity of a specific resource
 */
export async function getUserResourceQuantity(
  userId: string,
  resourceTypeId: string
) {
  const result = await db
    .select({ quantity: userInventories.quantity })
    .from(userInventories)
    .where(
      and(
        eq(userInventories.user_id, userId),
        eq(userInventories.resource_type_id, resourceTypeId)
      )
    )
    .limit(1);

  return result[0]?.quantity || "0";
}

/**
 * Add resources to user's inventory
 */
export async function addResourcesToInventory(
  userId: string,
  resourceTypeId: string,
  quantity: string
) {
  const existing = await db
    .select()
    .from(userInventories)
    .where(
      and(
        eq(userInventories.user_id, userId),
        eq(userInventories.resource_type_id, resourceTypeId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing inventory
    const result = await db
      .update(userInventories)
      .set({
        quantity: sql`${userInventories.quantity} + ${quantity}`,
        updated_at: new Date(),
      })
      .where(eq(userInventories.id, existing[0].id))
      .returning();
    return result[0];
  } else {
    // Create new inventory entry
    const result = await db
      .insert(userInventories)
      .values({
        user_id: userId,
        resource_type_id: resourceTypeId,
        quantity,
      })
      .returning();
    return result[0];
  }
}

/**
 * Get user's last harvest time
 */
export async function getLastHarvestTime(userId: string) {
  const result = await db
    .select({ last_harvest_at: generatorCooldowns.last_harvest_at })
    .from(generatorCooldowns)
    .where(eq(generatorCooldowns.user_id, userId))
    .limit(1);

  return result[0]?.last_harvest_at || null;
}

/**
 * Update user's last harvest time
 */
export async function updateLastHarvestTime(userId: string) {
  const now = new Date();

  const existing = await db
    .select()
    .from(generatorCooldowns)
    .where(eq(generatorCooldowns.user_id, userId))
    .limit(1);

  if (existing.length > 0) {
    const result = await db
      .update(generatorCooldowns)
      .set({ last_harvest_at: now })
      .where(eq(generatorCooldowns.user_id, userId))
      .returning();
    return result[0];
  } else {
    const result = await db
      .insert(generatorCooldowns)
      .values({
        user_id: userId,
        last_harvest_at: now,
      })
      .returning();
    return result[0];
  }
}
