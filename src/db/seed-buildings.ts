import db from "./client";
import { buildingTypes, buildingCosts, buildingProduction } from "./schema";
import { getResourceTypeByName } from "./queries";
import { eq } from "drizzle-orm";

/**
 * Seed initial building types into the database
 * Run with: npx tsx src/db/seed-buildings.ts
 */
async function seedBuildings() {
  console.log("Seeding building types...");

  // Define building types
  const initialBuildings = [
    {
      name: "resource_dispenser",
      display_name: "Resource Dispenser",
      description: "Basic resource generator for starting players",
      tier: 0,
      icon: "PackageOpen",
    },
    {
      name: "stone_quarry",
      display_name: "Stone Quarry",
      description: "Extracts stone from bedrock",
      tier: 1,
      icon: "Mountain",
    },
    {
      name: "scrap_yard",
      display_name: "Scrap Yard",
      description: "Processes scrap metal from salvage",
      tier: 1,
      icon: "Wrench",
    },
    {
      name: "fuel_extractor",
      display_name: "Fuel Extractor",
      description: "Extracts and refines raw fuel",
      tier: 1,
      icon: "Fuel",
    },
  ];

  // Define building costs (what resources are needed to buy each building)
  const buildingCostConfigs = [
    {
      buildingName: "resource_dispenser",
      costs: [], // FREE
    },
    {
      buildingName: "stone_quarry",
      costs: [{ resourceName: "stone", quantity: 20 }],
    },
    {
      buildingName: "scrap_yard",
      costs: [
        { resourceName: "stone", quantity: 25 },
        { resourceName: "scrap_metal", quantity: 10 },
      ],
    },
    {
      buildingName: "fuel_extractor",
      costs: [
        { resourceName: "stone", quantity: 30 },
        { resourceName: "scrap_metal", quantity: 15 },
      ],
    },
  ];

  // Define production config (what each building produces)
  const buildingProductionConfigs = [
    {
      buildingName: "resource_dispenser",
      production: [
        // { resourceName: "stone", ratePerMinute: 1, storageCapacity: 100 },
      ],
    },
    {
      buildingName: "stone_quarry",
      production: [
        { resourceName: "stone", ratePerMinute: 3, storageCapacity: 300 },
      ],
    },
    {
      buildingName: "scrap_yard",
      production: [
        {
          resourceName: "scrap_metal",
          ratePerMinute: 2,
          storageCapacity: 200,
        },
      ],
    },
    {
      buildingName: "fuel_extractor",
      production: [
        { resourceName: "raw_fuel", ratePerMinute: 2, storageCapacity: 250 },
      ],
    },
  ];

  try {
    // Seed building types
    console.log("\nAdding building types...");
    for (const building of initialBuildings) {
      const result = await db
        .insert(buildingTypes)
        .values(building)
        .onConflictDoNothing({ target: buildingTypes.name })
        .returning();

      if (result.length > 0) {
        console.log(`✓ Added building type: ${building.display_name}`);
      } else {
        console.log(`• Building type already exists: ${building.display_name}`);
      }
    }

    // Seed building costs
    console.log("\nAdding building costs...");
    for (const config of buildingCostConfigs) {
      const building = initialBuildings.find(
        (b) => b.name === config.buildingName
      );
      if (!building) continue;

      // Get building ID
      const [buildingRow] = await db
        .select()
        .from(buildingTypes)
        .where(eq(buildingTypes.name, config.buildingName))
        .limit(1);

      if (!buildingRow) {
        console.error(`✗ Building not found: ${config.buildingName}`);
        continue;
      }

      for (const cost of config.costs) {
        const resource = await getResourceTypeByName(cost.resourceName);
        if (!resource) {
          console.error(`✗ Resource not found: ${cost.resourceName}`);
          continue;
        }

        const result = await db
          .insert(buildingCosts)
          .values({
            building_type_id: buildingRow.id,
            resource_type_id: resource.id,
            quantity: cost.quantity,
          })
          .onConflictDoUpdate({
            target: [
              buildingCosts.building_type_id,
              buildingCosts.resource_type_id,
            ],
            set: {
              quantity: cost.quantity,
            },
          })
          .returning();

        if (result.length > 0) {
          console.log(
            `✓ Added cost: ${building.display_name} costs ${cost.quantity} ${resource.display_name}`
          );
        }
      }

      if (config.costs.length === 0) {
        console.log(`✓ ${building.display_name} costs nothing (FREE)`);
      }
    }

    // Seed building production
    console.log("\nAdding production rates...");
    for (const config of buildingProductionConfigs) {
      const building = initialBuildings.find(
        (b) => b.name === config.buildingName
      );
      if (!building) continue;

      const [buildingRow] = await db
        .select()
        .from(buildingTypes)
        .where(eq(buildingTypes.name, config.buildingName))
        .limit(1);

      if (!buildingRow) {
        console.error(`✗ Building not found: ${config.buildingName}`);
        continue;
      }

      for (const prod of config.production) {
        const resource = await getResourceTypeByName(prod.resourceName);
        if (!resource) {
          console.error(`✗ Resource not found: ${prod.resourceName}`);
          continue;
        }

        const result = await db
          .insert(buildingProduction)
          .values({
            building_type_id: buildingRow.id,
            resource_type_id: resource.id,
            rate_per_minute: prod.ratePerMinute,
            storage_capacity: prod.storageCapacity,
          })
          .onConflictDoNothing()
          .returning();

        if (result.length > 0) {
          console.log(
            `✓ Added production: ${building.display_name} produces ${prod.ratePerMinute}/min of ${resource.display_name} (cap: ${prod.storageCapacity})`
          );
        }
      }
    }

    console.log("\nBuilding seeding complete!");
  } catch (error) {
    console.error("Error seeding buildings:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedBuildings();
