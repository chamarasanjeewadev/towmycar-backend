CREATE TABLE IF NOT EXISTS "breakdown_assignment" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"driver_id" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"user_status" varchar(20) DEFAULT 'waiting' NOT NULL,
	"estimated_cost" numeric(10, 2),
	"estimate_explanation" text,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "breakdown_request" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"request_type" varchar(50) NOT NULL,
	"location_address" text NOT NULL,
	"user_location" geometry(point) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "driver" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(255),
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(20),
	"vehicle_type" varchar(100),
	"vehicle_registration" varchar(20),
	"license_number" varchar(50),
	"service_radius" integer,
	"primary_location" geometry(point),
	"working_hours" varchar(100),
	"experience_years" integer,
	"insurance_details" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "driver_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fcm_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"browser_info" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"firstName" varchar(255),
	"lastName" varchar(255),
	"email" varchar(255),
	"postcode" varchar(20),
	"vehicleRegistration" varchar(20),
	"mobileNumber" varchar(20)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "breakdown_assignment" ADD CONSTRAINT "breakdown_assignment_request_id_breakdown_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."breakdown_request"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "breakdown_assignment" ADD CONSTRAINT "breakdown_assignment_driver_id_driver_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."driver"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "breakdown_request" ADD CONSTRAINT "breakdown_request_user_id_user_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fcm_tokens" ADD CONSTRAINT "fcm_tokens_user_id_user_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
