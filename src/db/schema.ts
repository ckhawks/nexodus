import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  integer,
  text,
  decimal,
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
    quantity: decimal("quantity", { precision: 20, scale: 2 })
      .notNull()
      .default("0"),
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
