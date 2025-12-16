CREATE TABLE "building_costs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_type_id" uuid NOT NULL,
	"resource_type_id" uuid NOT NULL,
	"quantity" numeric(20, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "building_production" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_type_id" uuid NOT NULL,
	"resource_type_id" uuid NOT NULL,
	"rate_per_minute" numeric(10, 2) NOT NULL,
	"storage_capacity" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "building_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"tier" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "building_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_buildings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"building_type_id" uuid NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"last_collection_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "building_costs" ADD CONSTRAINT "building_costs_building_type_id_building_types_id_fk" FOREIGN KEY ("building_type_id") REFERENCES "public"."building_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_costs" ADD CONSTRAINT "building_costs_resource_type_id_resource_types_id_fk" FOREIGN KEY ("resource_type_id") REFERENCES "public"."resource_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_production" ADD CONSTRAINT "building_production_building_type_id_building_types_id_fk" FOREIGN KEY ("building_type_id") REFERENCES "public"."building_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_production" ADD CONSTRAINT "building_production_resource_type_id_resource_types_id_fk" FOREIGN KEY ("resource_type_id") REFERENCES "public"."resource_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_buildings" ADD CONSTRAINT "user_buildings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_buildings" ADD CONSTRAINT "user_buildings_building_type_id_building_types_id_fk" FOREIGN KEY ("building_type_id") REFERENCES "public"."building_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_building_cost" ON "building_costs" USING btree ("building_type_id","resource_type_id");--> statement-breakpoint
CREATE INDEX "idx_building_production" ON "building_production" USING btree ("building_type_id","resource_type_id");--> statement-breakpoint
CREATE INDEX "idx_user_building" ON "user_buildings" USING btree ("user_id","building_type_id");