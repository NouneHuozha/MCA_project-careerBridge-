ALTER TABLE "data_imports"
  ADD COLUMN IF NOT EXISTS "dataset_type" varchar(32) DEFAULT 'unknown' NOT NULL,
  ADD COLUMN IF NOT EXISTS "file_content_base64" text,
  ADD COLUMN IF NOT EXISTS "source_hash" varchar(64),
  ADD COLUMN IF NOT EXISTS "warning_count" integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS "error_count" integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS "status" varchar(24) DEFAULT 'uploaded' NOT NULL,
  ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone;

CREATE TABLE IF NOT EXISTS "data_import_rows" (
  "id" serial PRIMARY KEY NOT NULL,
  "import_id" integer NOT NULL,
  "sheet_name" varchar(120),
  "row_number" integer NOT NULL,
  "raw_data" jsonb NOT NULL,
  "normalized_data" jsonb,
  "status" varchar(24) DEFAULT 'needs_review' NOT NULL,
  "warnings" jsonb DEFAULT '[]'::jsonb,
  "errors" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "data_import_rows_import_idx" ON "data_import_rows" USING btree ("import_id");

ALTER TABLE "institutions"
  ADD COLUMN IF NOT EXISTS "category" varchar(100),
  ADD COLUMN IF NOT EXISTS "board" varchar(100),
  ADD COLUMN IF NOT EXISTS "social_media_url" text,
  ADD COLUMN IF NOT EXISTS "courses_offered" text;

ALTER TABLE "institutions"
  ALTER COLUMN "city" TYPE varchar(200);

ALTER TABLE "entrance_exams"
  ADD COLUMN IF NOT EXISTS "category" varchar(60),
  ADD COLUMN IF NOT EXISTS "scope" varchar(40),
  ADD COLUMN IF NOT EXISTS "state" varchar(80),
  ADD COLUMN IF NOT EXISTS "exam_mode" varchar(40),
  ADD COLUMN IF NOT EXISTS "status" varchar(24) DEFAULT 'active' NOT NULL;
