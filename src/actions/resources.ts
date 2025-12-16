"use server";

import { getSession } from "@/auth/lib";
import {
  getAllResourceTypes,
  getLastHarvestTime,
  updateLastHarvestTime,
  addResourcesToInventory,
  getUserInventory,
} from "@/db/queries";

// Cooldown in milliseconds (5 seconds for testing, increase for production)
const HARVEST_COOLDOWN_MS = 5000;

// Min and max quantities for random resource generation
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 5;

/**
 * Harvest resources from the generator
 * Returns random resources with cooldown enforcement
 */
export async function harvestResources() {
  try {
    // Verify user is logged in
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to harvest resources.",
      };
    }

    const userId = session.user.id;

    // Check cooldown
    const lastHarvest = await getLastHarvestTime(userId);
    const now = new Date();

    if (lastHarvest) {
      const timeSinceLastHarvest = now.getTime() - lastHarvest.getTime();
      if (timeSinceLastHarvest < HARVEST_COOLDOWN_MS) {
        const remainingMs = HARVEST_COOLDOWN_MS - timeSinceLastHarvest;
        return {
          success: false,
          message: "Generator is cooling down.",
          cooldownRemaining: Math.ceil(remainingMs / 1000),
        };
      }
    }

    // Get all available tier 1 resources
    const allResources = await getAllResourceTypes();
    const tier1Resources = allResources.filter((r) => r.tier === 1);

    if (tier1Resources.length === 0) {
      return {
        success: false,
        message: "No resources available to harvest.",
      };
    }

    // Select a random resource
    const randomResource =
      tier1Resources[Math.floor(Math.random() * tier1Resources.length)];

    // Generate random quantity
    const quantity =
      Math.floor(Math.random() * (MAX_QUANTITY - MIN_QUANTITY + 1)) +
      MIN_QUANTITY;

    // Add resources to inventory
    await addResourcesToInventory(
      userId,
      randomResource.id,
      quantity
    );

    // Update cooldown
    await updateLastHarvestTime(userId);

    return {
      success: true,
      message: `Harvested ${quantity}x ${randomResource.display_name}!`,
      resource: {
        name: randomResource.display_name,
        icon: randomResource.icon,
        quantity,
      },
      nextHarvestAvailable: new Date(now.getTime() + HARVEST_COOLDOWN_MS),
    };
  } catch (error) {
    console.error("Error harvesting resources:", error);
    return {
      success: false,
      message: "An error occurred while harvesting resources.",
    };
  }
}

/**
 * Get user's current inventory
 */
export async function getInventory() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to view inventory.",
        inventory: [],
      };
    }

    const inventory = await getUserInventory(session.user.id);

    return {
      success: true,
      inventory,
    };
  } catch (error) {
    console.error("Error getting inventory:", error);
    return {
      success: false,
      message: "An error occurred while fetching inventory.",
      inventory: [],
    };
  }
}

/**
 * Get user's resources for affordability checking
 */
export async function getResourcesForUser() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to view resources.",
        resources: [],
      };
    }

    const inventory = await getUserInventory(session.user.id);

    return {
      success: true,
      resources: inventory,
    };
  } catch (error) {
    console.error("Error getting user resources:", error);
    return {
      success: false,
      message: "An error occurred while fetching resources.",
      resources: [],
    };
  }
}

/**
 * Get cooldown status for the harvester
 */
export async function getHarvesterCooldown() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        isReady: false,
        remainingSeconds: 0,
      };
    }

    const lastHarvest = await getLastHarvestTime(session.user.id);

    if (!lastHarvest) {
      return {
        success: true,
        isReady: true,
        remainingSeconds: 0,
      };
    }

    const now = new Date();
    const timeSinceLastHarvest = now.getTime() - lastHarvest.getTime();

    if (timeSinceLastHarvest >= HARVEST_COOLDOWN_MS) {
      return {
        success: true,
        isReady: true,
        remainingSeconds: 0,
      };
    }

    const remainingMs = HARVEST_COOLDOWN_MS - timeSinceLastHarvest;

    return {
      success: true,
      isReady: false,
      remainingSeconds: Math.ceil(remainingMs / 1000),
    };
  } catch (error) {
    console.error("Error getting cooldown:", error);
    return {
      success: false,
      isReady: false,
      remainingSeconds: 0,
    };
  }
}
