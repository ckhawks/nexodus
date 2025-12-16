import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  integer,
  text,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Users table - stores user account information
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("idx_user_email").on(table.email),
    usernameIdx: index("idx_user_username").on(table.username),
  })
);

/**
 * Resource Types - defines all available resources in the game
 */
export const resourceTypes = pgTable("resource_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  display_name: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  tier: integer("tier").notNull().default(1), // 1-5 for resource progression
  icon: varchar("icon", { length: 50 }), // Lucide icon name
  created_at: timestamp("created_at").defaultNow().notNull(),
});

/**
 * User Inventories - tracks how many of each resource a user has
 */
export const userInventories = pgTable(
  "user_inventories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resource_type_id: uuid("resource_type_id")
      .notNull()
      .references(() => resourceTypes.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(0),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userResourceIdx: index("idx_user_resource").on(
      table.user_id,
      table.resource_type_id
    ),
  })
);

/**
 * Generator Cooldowns - tracks when users last used their resource generators
 */
export const generatorCooldowns = pgTable(
  "generator_cooldowns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    last_harvest_at: timestamp("last_harvest_at").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_generator_user").on(table.user_id),
  })
);

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
  inventories: many(userInventories),
  generatorCooldown: many(generatorCooldowns),
}));

export const resourceTypesRelations = relations(resourceTypes, ({ many }) => ({
  inventories: many(userInventories),
}));

export const userInventoriesRelations = relations(
  userInventories,
  ({ one }) => ({
    user: one(users, {
      fields: [userInventories.user_id],
      references: [users.id],
    }),
    resourceType: one(resourceTypes, {
      fields: [userInventories.resource_type_id],
      references: [resourceTypes.id],
    }),
  })
);

export const generatorCooldownsRelations = relations(
  generatorCooldowns,
  ({ one }) => ({
    user: one(users, {
      fields: [generatorCooldowns.user_id],
      references: [users.id],
    }),
  })
);

/**
 * Building Types - defines all available buildings in the game
 */
export const buildingTypes = pgTable("building_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  display_name: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }), // Lucide icon name
  tier: integer("tier").notNull().default(1), // 0-5 for progression
  created_at: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Building Costs - many-to-many: what resources are required to purchase a building
 */
export const buildingCosts = pgTable(
  "building_costs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    building_type_id: uuid("building_type_id")
      .notNull()
      .references(() => buildingTypes.id, { onDelete: "cascade" }),
    resource_type_id: uuid("resource_type_id")
      .notNull()
      .references(() => resourceTypes.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    buildingResourceUnique: uniqueIndex("idx_building_cost_unique").on(
      table.building_type_id,
      table.resource_type_id
    ),
  })
);

/**
 * Building Production - many-to-many: what resources a building produces
 */
export const buildingProduction = pgTable(
  "building_production",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    building_type_id: uuid("building_type_id")
      .notNull()
      .references(() => buildingTypes.id, { onDelete: "cascade" }),
    resource_type_id: uuid("resource_type_id")
      .notNull()
      .references(() => resourceTypes.id, { onDelete: "cascade" }),
    rate_per_minute: integer("rate_per_minute").notNull(), // resources per minute
    storage_capacity: integer("storage_capacity").notNull().default(100), // max before stopping production
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    buildingResourceIdx: index("idx_building_production").on(
      table.building_type_id,
      table.resource_type_id
    ),
  })
);

/**
 * User Buildings - tracks which buildings a user owns
 */
export const userBuildings = pgTable(
  "user_buildings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    building_type_id: uuid("building_type_id")
      .notNull()
      .references(() => buildingTypes.id, { onDelete: "cascade" }),
    level: integer("level").notNull().default(1), // for future upgrades
    last_collection_at: timestamp("last_collection_at").notNull(), // used to calculate production
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userBuildingIdx: index("idx_user_building").on(
      table.user_id,
      table.building_type_id
    ),
  })
);

/**
 * Relations for buildings
 */
export const buildingTypesRelations = relations(
  buildingTypes,
  ({ many }) => ({
    costs: many(buildingCosts),
    production: many(buildingProduction),
    userBuildings: many(userBuildings),
  })
);

export const buildingCostsRelations = relations(
  buildingCosts,
  ({ one }) => ({
    buildingType: one(buildingTypes, {
      fields: [buildingCosts.building_type_id],
      references: [buildingTypes.id],
    }),
    resourceType: one(resourceTypes, {
      fields: [buildingCosts.resource_type_id],
      references: [resourceTypes.id],
    }),
  })
);

export const buildingProductionRelations = relations(
  buildingProduction,
  ({ one }) => ({
    buildingType: one(buildingTypes, {
      fields: [buildingProduction.building_type_id],
      references: [buildingTypes.id],
    }),
    resourceType: one(resourceTypes, {
      fields: [buildingProduction.resource_type_id],
      references: [resourceTypes.id],
    }),
  })
);

export const userBuildingsRelations = relations(
  userBuildings,
  ({ one }) => ({
    user: one(users, {
      fields: [userBuildings.user_id],
      references: [users.id],
    }),
    buildingType: one(buildingTypes, {
      fields: [userBuildings.building_type_id],
      references: [buildingTypes.id],
    }),
  })
);
