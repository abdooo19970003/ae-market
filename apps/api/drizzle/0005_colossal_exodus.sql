ALTER TABLE "category_attributes" ALTER COLUMN "input_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "category_attributes" ALTER COLUMN "input_type" SET DEFAULT 'text'::text;--> statement-breakpoint
DROP TYPE "public"."attribute_input_type";--> statement-breakpoint
CREATE TYPE "public"."attribute_input_type" AS ENUM('text', 'number', 'select', 'multi_select', 'boolean');--> statement-breakpoint
ALTER TABLE "category_attributes" ALTER COLUMN "input_type" SET DEFAULT 'text'::"public"."attribute_input_type";--> statement-breakpoint
ALTER TABLE "category_attributes" ALTER COLUMN "input_type" SET DATA TYPE "public"."attribute_input_type" USING "input_type"::"public"."attribute_input_type";