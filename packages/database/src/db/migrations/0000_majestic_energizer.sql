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
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"vehicle_type" varchar(100) NOT NULL,
	"vehicle_registration" varchar(20) NOT NULL,
	"license_number" varchar(50) NOT NULL,
	"service_radius" integer NOT NULL,
	"primary_location" geometry(point) NOT NULL,
	"working_hours" varchar(100) NOT NULL,
	"experience_years" integer NOT NULL,
	"insurance_details" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "driver_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "driver_request" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"driver_id" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"firstName" varchar(255) NOT NULL,
	"lastName" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"postcode" varchar(20) NOT NULL,
	"vehicleRegistration" varchar(20) NOT NULL,
	"mobileNumber" varchar(20) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "breakdown_request" ADD CONSTRAINT "breakdown_request_user_id_user_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "driver_request" ADD CONSTRAINT "driver_request_request_id_breakdown_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."breakdown_request"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "driver_request" ADD CONSTRAINT "driver_request_driver_id_driver_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."driver"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
