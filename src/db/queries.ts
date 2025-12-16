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
  buildingTypes,
  buildingCosts,
  buildingProduction,
  userBuildings,
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
  quantity: string | number
) {
  const quantityNum = typeof quantity === "string" ? parseInt(quantity) : quantity;
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
        quantity: sql`${userInventories.quantity} + ${quantityNum}`,
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
        quantity: quantityNum,
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

// ============================================================================
// BUILDING QUERIES
// ============================================================================

/**
 * Get all building types with their costs and production rates
 */
export async function getAllBuildingTypes() {
  return await db
    .select({
      id: buildingTypes.id,
      name: buildingTypes.name,
      display_name: buildingTypes.display_name,
      description: buildingTypes.description,
      icon: buildingTypes.icon,
      tier: buildingTypes.tier,
      created_at: buildingTypes.created_at,
    })
    .from(buildingTypes)
    .orderBy(buildingTypes.tier);
}

/**
 * Get building type by ID
 */
export async function getBuildingTypeById(buildingTypeId: string) {
  const result = await db
    .select()
    .from(buildingTypes)
    .where(eq(buildingTypes.id, buildingTypeId))
    .limit(1);
  return result[0] || null;
}

/**
 * Get building costs for a specific building type
 */
export async function getBuildingCosts(buildingTypeId: string) {
  return await db
    .select({
      resource_type_id: buildingCosts.resource_type_id,
      quantity: buildingCosts.quantity,
      resourceType: {
        id: resourceTypes.id,
        name: resourceTypes.name,
        display_name: resourceTypes.display_name,
        icon: resourceTypes.icon,
      },
    })
    .from(buildingCosts)
    .innerJoin(resourceTypes, eq(buildingCosts.resource_type_id, resourceTypes.id))
    .where(eq(buildingCosts.building_type_id, buildingTypeId));
}

/**
 * Get production configuration for a specific building type
 */
export async function getBuildingProduction(buildingTypeId: string) {
  return await db
    .select({
      resource_type_id: buildingProduction.resource_type_id,
      rate_per_minute: buildingProduction.rate_per_minute,
      storage_capacity: buildingProduction.storage_capacity,
      resourceType: {
        id: resourceTypes.id,
        name: resourceTypes.name,
        display_name: resourceTypes.display_name,
        icon: resourceTypes.icon,
      },
    })
    .from(buildingProduction)
    .innerJoin(
      resourceTypes,
      eq(buildingProduction.resource_type_id, resourceTypes.id)
    )
    .where(eq(buildingProduction.building_type_id, buildingTypeId));
}

/**
 * Get all buildings owned by a user
 */
export async function getUserBuildings(userId: string) {
  const buildings = await db
    .select({
      id: userBuildings.id,
      user_id: userBuildings.user_id,
      building_type_id: userBuildings.building_type_id,
      level: userBuildings.level,
      last_collection_at: userBuildings.last_collection_at,
      created_at: userBuildings.created_at,
      buildingType: {
        id: buildingTypes.id,
        name: buildingTypes.name,
        display_name: buildingTypes.display_name,
        description: buildingTypes.description,
        icon: buildingTypes.icon,
        tier: buildingTypes.tier,
      },
    })
    .from(userBuildings)
    .innerJoin(buildingTypes, eq(userBuildings.building_type_id, buildingTypes.id))
    .where(eq(userBuildings.user_id, userId));

  // For each building, also fetch production rates
  const buildingsWithProduction = await Promise.all(
    buildings.map(async (building) => {
      const production = await getBuildingProduction(building.building_type_id);
      return { ...building, production };
    })
  );

  return buildingsWithProduction;
}

/**
 * Check if user can afford a building
 */
export async function canAffordBuilding(
  userId: string,
  buildingTypeId: string
): Promise<boolean> {
  const costs = await getBuildingCosts(buildingTypeId);

  if (costs.length === 0) {
    return true; // Building is free
  }

  for (const cost of costs) {
    const inventory = await db
      .select({ quantity: userInventories.quantity })
      .from(userInventories)
      .where(
        and(
          eq(userInventories.user_id, userId),
          eq(userInventories.resource_type_id, cost.resource_type_id)
        )
      )
      .limit(1);

    const currentQuantity = inventory.length > 0 ? inventory[0].quantity : 0;

    if (currentQuantity < cost.quantity) {
      return false;
    }
  }

  return true;
}

/**
 * Purchase a building (transaction)
 */
export async function purchaseBuilding(
  userId: string,
  buildingTypeId: string
): Promise<{ success: boolean; building?: any; error?: string }> {
  try {
    // Check if user already owns this building type
    const existingBuilding = await db
      .select()
      .from(userBuildings)
      .where(
        and(
          eq(userBuildings.user_id, userId),
          eq(userBuildings.building_type_id, buildingTypeId)
        )
      )
      .limit(1);

    if (existingBuilding.length > 0) {
      return {
        success: false,
        error: "You already own this building type",
      };
    }

    // Check if user can afford
    const canAfford = await canAffordBuilding(userId, buildingTypeId);
    if (!canAfford) {
      return { success: false, error: "Insufficient resources" };
    }

    // Get building type
    const buildingType = await getBuildingTypeById(buildingTypeId);
    if (!buildingType) {
      return { success: false, error: "Building type not found" };
    }

    // Get costs
    const costs = await getBuildingCosts(buildingTypeId);

    // Deduct resources
    for (const cost of costs) {
      await subtractResourcesFromInventory(userId, [
        {
          resource_type_id: cost.resource_type_id,
          quantity: cost.quantity,
        },
      ]);
    }

    // Create building
    const now = new Date();
    const result = await db
      .insert(userBuildings)
      .values({
        user_id: userId,
        building_type_id: buildingTypeId,
        last_collection_at: now,
      })
      .returning();

    // Fetch production info
    const production = await getBuildingProduction(buildingTypeId);

    return {
      success: true,
      building: {
        ...result[0],
        buildingType,
        production,
      },
    };
  } catch (error) {
    console.error("Error purchasing building:", error);
    return { success: false, error: "Database error" };
  }
}

/**
 * Calculate current production for a building
 */
export async function calculateBuildingProduction(userBuilding: {
  building_type_id: string;
  last_collection_at: Date;
}) {
  const production = await getBuildingProduction(userBuilding.building_type_id);

  const minutesElapsed =
    (Date.now() - userBuilding.last_collection_at.getTime()) / (1000 * 60);

  return production.map((prod) => ({
    resource_type_id: prod.resource_type_id,
    resourceType: prod.resourceType,
    rate_per_minute: prod.rate_per_minute,
    produced: Math.min(
      minutesElapsed * prod.rate_per_minute,
      prod.storage_capacity
    ),
    storage_capacity: prod.storage_capacity,
  }));
}

/**
 * Collect resources from a building (transaction)
 */
export async function collectBuildingResources(
  userId: string,
  buildingId: string
): Promise<{ success: boolean; collected?: any[]; error?: string }> {
  try {
    // Get building
    const [building] = await db
      .select()
      .from(userBuildings)
      .where(and(eq(userBuildings.id, buildingId), eq(userBuildings.user_id, userId)))
      .limit(1);

    if (!building) {
      return { success: false, error: "Building not found" };
    }

    // Calculate production
    const production = await calculateBuildingProduction(building);

    // Add to inventory and track fractional remainders
    const collected = [];
    let maxFractionalMinutesDebt = 0; // Time to subtract from last_collection_at to preserve decimals

    for (const prod of production) {
      // Round down to integers - no fractional resources in inventory
      const roundedQuantity = Math.floor(prod.produced);
      const fractionalPart = prod.produced - roundedQuantity;

      if (roundedQuantity > 0) {
        await addResourcesToInventory(
          userId,
          prod.resource_type_id,
          roundedQuantity
        );
        collected.push({
          resourceType: prod.resourceType,
          quantity: roundedQuantity,
          originalProduced: prod.produced,
        });
      }

      // Calculate time equivalent of the fractional part
      // fractionalPart / rate_per_minute = minutes of production time for that fraction
      if (fractionalPart > 0 && prod.rate_per_minute > 0) {
        const fractionalMinutes = fractionalPart / prod.rate_per_minute;
        // Track the maximum fractional time (most conservative approach)
        maxFractionalMinutesDebt = Math.max(maxFractionalMinutesDebt, fractionalMinutes);
      }
    }

    // Update last collection time, adjusted backwards by fractional time to preserve decimal progress
    const now = new Date();
    const adjustedCollectionTime = new Date(now.getTime() - maxFractionalMinutesDebt * 60 * 1000);

    await db
      .update(userBuildings)
      .set({ last_collection_at: adjustedCollectionTime })
      .where(eq(userBuildings.id, buildingId));

    return { success: true, collected };
  } catch (error) {
    console.error("Error collecting building resources:", error);
    return { success: false, error: "Database error" };
  }
}

/**
 * Subtract multiple resources from inventory (helper)
 */
export async function subtractResourcesFromInventory(
  userId: string,
  costs: Array<{ resource_type_id: string; quantity: number }>
): Promise<boolean> {
  try {
    for (const cost of costs) {
      const existing = await db
        .select()
        .from(userInventories)
        .where(
          and(
            eq(userInventories.user_id, userId),
            eq(userInventories.resource_type_id, cost.resource_type_id)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(userInventories)
          .set({
            quantity: sql`${userInventories.quantity} - ${cost.quantity}`,
            updated_at: new Date(),
          })
          .where(eq(userInventories.id, existing[0].id));
      } else {
        // Should not happen if we checked canAfford, but handle it
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Error subtracting resources:", error);
    return false;
  }
}
