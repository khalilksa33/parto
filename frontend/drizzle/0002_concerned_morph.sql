CREATE TABLE "vin_cache" (
	"vin" varchar(20) PRIMARY KEY NOT NULL,
	"make" varchar(100),
	"model" varchar(100),
	"year" varchar(10),
	"engine_details" jsonb,
	"raw_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "weight" numeric(10, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "length" numeric(10, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "width" numeric(10, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "height" numeric(10, 2) DEFAULT '0.00';