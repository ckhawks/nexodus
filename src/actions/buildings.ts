"use server";

import { getSession } from "@/auth/lib";
import {
  getAllBuildingTypes,
  getBuildingCosts,
  getBuildingProduction,
  getUserBuildings,
  purchaseBuilding as purchaseBuildingQuery,
  collectBuildingResources as collectResourcesQuery,
  canAffordBuilding,
} from "@/db/queries";

/**
 * Get all available building types
 */
export async function getBuildingTypes() {
  try {
    const buildingTypes = await getAllBuildingTypes();

    // Fetch costs and production for each building
    const buildingsWithDetails = await Promise.all(
      buildingTypes.map(async (building) => {
        const costs = await getBuildingCosts(building.id);
        const production = await getBuildingProduction(building.id);
        return {
          ...building,
          costs,
          production,
        };
      })
    );

    return {
      success: true,
      buildingTypes: buildingsWithDetails,
    };
  } catch (error) {
    console.error("Error fetching building types:", error);
    return {
      success: false,
      message: "Failed to fetch building types",
    };
  }
}

/**
 * Get user's owned buildings
 */
export async function getBuildingsForUser() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to view your buildings",
      };
    }

    const buildings = await getUserBuildings(session.user.id);

    return {
      success: true,
      buildings,
    };
  } catch (error) {
    console.error("Error fetching user buildings:", error);
    return {
      success: false,
      message: "Failed to fetch your buildings",
    };
  }
}

/**
 * Purchase a building
 */
export async function purchaseBuilding(buildingTypeId: string) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to purchase buildings",
      };
    }

    // Check if user can afford
    const canAfford = await canAffordBuilding(session.user.id, buildingTypeId);
    if (!canAfford) {
      return {
        success: false,
        message: "You do not have enough resources to purchase this building",
      };
    }

    // Purchase the building
    const result = await purchaseBuildingQuery(session.user.id, buildingTypeId);

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to purchase building",
      };
    }

    return {
      success: true,
      message: `Successfully purchased ${result.building?.buildingType.display_name}!`,
      building: result.building,
    };
  } catch (error) {
    console.error("Error purchasing building:", error);
    return {
      success: false,
      message: "An error occurred while purchasing the building",
    };
  }
}

/**
 * Collect resources from a building
 */
export async function collectResources(buildingId: string) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to collect resources",
      };
    }

    const result = await collectResourcesQuery(session.user.id, buildingId);

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to collect resources",
      };
    }

    return {
      success: true,
      message: "Resources collected!",
      collected: result.collected,
    };
  } catch (error) {
    console.error("Error collecting resources:", error);
    return {
      success: false,
      message: "An error occurred while collecting resources",
    };
  }
}
