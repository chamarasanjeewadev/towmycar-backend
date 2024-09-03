CREATE TABLE IF NOT EXISTS "breakdown_request" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"request_type" varchar(50) NOT NULL,
	"location" text NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
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
 ALTER TABLE "breakdown_request" ADD CONSTRAINT "breakdown_request_user_id_user_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
