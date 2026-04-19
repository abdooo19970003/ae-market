CREATE TABLE "attribute_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"attribute_id" integer NOT NULL,
	"label" varchar(100) NOT NULL,
	"value" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "attribute_options_attribute_id_value_unique" UNIQUE("attribute_id","value")
);
--> statement-breakpoint
CREATE TABLE "product_attribute_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"attribute_id" integer NOT NULL,
	"value_text" text,
	"value_option_id" integer,
	CONSTRAINT "unique_product_attribute_value" UNIQUE("product_id","attribute_id")
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" integer NOT NULL,
	"old_cost_price" numeric(12, 2),
	"new_cost_price" numeric(12, 2) NOT NULL,
	"old_sell_price" numeric(12, 2),
	"new_sell_price" numeric(12, 2) NOT NULL,
	"reason" varchar(50) DEFAULT 'manual_update' NOT NULL,
	"note" text,
	"changed_by" integer,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"alt_text" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"name" varchar(255),
	"sku" varchar(100) NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "variant_attribute_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" integer NOT NULL,
	"attribute_id" integer NOT NULL,
	"value_text" text,
	"value_option_id" integer,
	CONSTRAINT "variant_attribute_values_variant_id_attribute_id_unique" UNIQUE("variant_id","attribute_id")
);
--> statement-breakpoint
CREATE TABLE "variant_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"alt_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variant_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" integer NOT NULL,
	"cost_price" numeric(12, 2) NOT NULL,
	"sell_price" numeric(12, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"effective_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_cost_price_positive" CHECK ("variant_prices"."cost_price" >= 0),
	CONSTRAINT "chk_sell_price_positive" CHECK ("variant_prices"."sell_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "category_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sku" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "attribute_options" ADD CONSTRAINT "attribute_options_attribute_id_category_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."category_attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_attribute_id_category_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."category_attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_value_option_id_attribute_options_id_fk" FOREIGN KEY ("value_option_id") REFERENCES "public"."attribute_options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_attribute_values" ADD CONSTRAINT "variant_attribute_values_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_attribute_values" ADD CONSTRAINT "variant_attribute_values_attribute_id_category_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."category_attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_attribute_values" ADD CONSTRAINT "variant_attribute_values_value_option_id_attribute_options_id_fk" FOREIGN KEY ("value_option_id") REFERENCES "public"."attribute_options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_images" ADD CONSTRAINT "variant_images_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_prices" ADD CONSTRAINT "variant_prices_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_sku_unique" UNIQUE("sku");