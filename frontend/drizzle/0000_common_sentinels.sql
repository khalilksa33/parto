CREATE TABLE "dispatches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"service_type" varchar(50) DEFAULT 'tow' NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_phone" varchar(50) NOT NULL,
	"pickup_location" varchar(255) NOT NULL,
	"dropoff_location" varchar(255) NOT NULL,
	"vehicle_details" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"quote" varchar(50),
	"accepted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"order_number" varchar(100) NOT NULL,
	"customer_id" uuid NOT NULL,
	"total_amount" numeric(15, 4) DEFAULT '0.0000' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "part_quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"price" numeric(15, 4) NOT NULL,
	"condition" varchar(50) NOT NULL,
	"notes" varchar(500),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "part_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_phone" varchar(50) NOT NULL,
	"vehicle_make" varchar(100) NOT NULL,
	"vehicle_model" varchar(100) NOT NULL,
	"vehicle_year" varchar(10) NOT NULL,
	"part_name" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" numeric(15, 4) DEFAULT '0.0000' NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text,
	"compatibility" jsonb,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"moderation_reason" text,
	"image" varchar(100),
	"rating" numeric(3, 2) DEFAULT '0.00',
	"featured" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"subdomain" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"business_type" varchar(100),
	"owner_name" varchar(255),
	"email" varchar(255),
	"phone" varchar(50),
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_accepted_by_tenants_id_fk" FOREIGN KEY ("accepted_by") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_quotes" ADD CONSTRAINT "part_quotes_request_id_part_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."part_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_quotes" ADD CONSTRAINT "part_quotes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;