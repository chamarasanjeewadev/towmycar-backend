CREATE TABLE IF NOT EXISTS "driver" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"vehicle_type" varchar(100) NOT NULL,
	"vehicle_registration" varchar(20) NOT NULL,
	"license_number" varchar(50) NOT NULL,
	"service_radius" integer NOT NULL,
	"primary_location" varchar(255) NOT NULL,
	"working_hours" varchar(100) NOT NULL,
	"experience_years" integer NOT NULL,
	"insurance_details" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "driver_email_unique" UNIQUE("email")
);
