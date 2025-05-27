-- Create departments table
CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "departments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "departments_name_key" UNIQUE ("name")
);

-- Create designations table
CREATE TABLE IF NOT EXISTS "public"."designations" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "designations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "designations_name_key" UNIQUE ("name")
); 