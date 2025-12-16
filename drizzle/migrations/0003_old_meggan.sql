DROP INDEX "idx_building_cost";--> statement-breakpoint
ALTER TABLE "building_costs" ALTER COLUMN "quantity" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "building_production" ALTER COLUMN "rate_per_minute" SET DATA TYPE integer;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_building_cost_unique" ON "building_costs" USING btree ("building_type_id","resource_type_id");