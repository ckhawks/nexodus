import db from "./client";
import { resourceTypes } from "./schema";

/**
 * Seed initial resource types into the database
 * Run with: npx tsx src/db/seed-resources.ts
 */
async function seedResources() {
  console.log("Seeding resource types...");

  const initialResources = [
    // Tier 1 Resources
    {
      name: "stone",
      display_name: "Stone",
      description: "Rough stone quarried from the ground. Foundation of construction.",
      tier: 1,
      icon: "Mountain",
    },
    {
      name: "scrap_metal",
      display_name: "Scrap Metal",
      description: "Salvaged metal pieces. Can be refined into useful materials.",
      tier: 1,
      icon: "Wrench",
    },
    {
      name: "raw_fuel",
      display_name: "Raw Fuel",
      description: "Unrefined energy source. Volatile but abundant.",
      tier: 1,
      icon: "Fuel",
    },
    {
      name: "data_fragments",
      display_name: "Data Fragments",
      description: "Corrupted data shards. Contain traces of valuable information.",
      tier: 1,
      icon: "Binary",
    },
  ];

  try {
    for (const resource of initialResources) {
      await db
        .insert(resourceTypes)
        .values(resource)
        .onConflictDoNothing({ target: resourceTypes.name });
      console.log(`✓ Added resource: ${resource.display_name}`);
    }

    console.log("\nResource seeding complete!");
  } catch (error) {
    console.error("Error seeding resources:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedResources();
