import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'staff');
  CREATE TYPE "public"."enum_products_variants_size" AS ENUM('newborn', '0-3m', '3-6m', '6-9m', '9-12m', '12-18m', '18-24m', '2y', '3y', '4y', '5y', '6y', '7-8y', '9-10y', '11-12y');
  CREATE TYPE "public"."enum_products_gender" AS ENUM('boys', 'girls', 'unisex');
  CREATE TYPE "public"."enum_products_age_group" AS ENUM('newborn', 'infant', 'toddler', 'kids');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_variants_size" AS ENUM('newborn', '0-3m', '3-6m', '6-9m', '9-12m', '12-18m', '18-24m', '2y', '3y', '4y', '5y', '6y', '7-8y', '9-10y', '11-12y');
  CREATE TYPE "public"."enum__products_v_version_gender" AS ENUM('boys', 'girls', 'unisex');
  CREATE TYPE "public"."enum__products_v_version_age_group" AS ENUM('newborn', 'infant', 'toddler', 'kids');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_size_guides_measurements_size" AS ENUM('newborn', '0-3m', '3-6m', '6-9m', '9-12m', '12-18m', '18-24m', '2y', '3y', '4y', '5y', '6y', '7-8y', '9-10y', '11-12y');
  CREATE TYPE "public"."enum_orders_status_history_status" AS ENUM('pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refused', 'failed_delivery', 'returned');
  CREATE TYPE "public"."enum_orders_status_history_payment_status" AS ENUM('unpaid', 'collected', 'refunded');
  CREATE TYPE "public"."enum_orders_status_history_source" AS ENUM('checkout', 'admin', 'system');
  CREATE TYPE "public"."enum_orders_notifications_channel" AS ENUM('whatsapp', 'email', 'sms');
  CREATE TYPE "public"."enum_orders_notifications_audience" AS ENUM('customer', 'staff');
  CREATE TYPE "public"."enum_orders_notifications_status" AS ENUM('ready', 'skipped', 'sent', 'failed');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refused', 'failed_delivery', 'returned');
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('cod');
  CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('unpaid', 'collected', 'refunded');
  CREATE TYPE "public"."enum_orders_city" AS ENUM('Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur', 'Sargodha', 'Gujrat', 'Sahiwal', 'Abbottabad', 'Rahim Yar Khan', 'Sukkur', 'Larkana', 'Mardan', 'Okara', 'Sheikhupura', 'Jhelum', 'Dera Ghazi Khan', 'Wah Cantt', 'Mirpur', 'Other');
  CREATE TYPE "public"."enum_orders_shipment_shipping_status" AS ENUM('not_booked', 'booked', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned', 'cancelled');
  CREATE TYPE "public"."enum_couriers_provider" AS ENUM('manual', 'tcs', 'leopard', 'trax', 'postex', 'callcourier', 'rider', 'other');
  CREATE TYPE "public"."enum_site_settings_city_shipping_city" AS ENUM('Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur', 'Sargodha', 'Gujrat', 'Sahiwal', 'Abbottabad', 'Rahim Yar Khan', 'Sukkur', 'Larkana', 'Mardan', 'Okara', 'Sheikhupura', 'Jhelum', 'Dera Ghazi Khan', 'Wah Cantt', 'Mirpur', 'Other');
  CREATE TYPE "public"."enum_site_settings_home_promos_icon" AS ENUM('cod', 'shipping', 'returns', 'sparkles');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'admin' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "products_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sku" varchar,
  	"size" "enum_products_variants_size",
  	"color" varchar,
  	"price" numeric,
  	"compare_at_price" numeric,
  	"stock" numeric DEFAULT 0
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"details" jsonb,
  	"category_id" integer,
  	"gender" "enum_products_gender" DEFAULT 'unisex',
  	"age_group" "enum_products_age_group" DEFAULT 'kids',
  	"material" varchar,
  	"care_instructions" varchar,
  	"size_guide_id" integer,
  	"featured" boolean DEFAULT false,
  	"sort_priority" numeric DEFAULT 0,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "_products_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"sku" varchar,
  	"size" "enum__products_v_version_variants_size",
  	"color" varchar,
  	"price" numeric,
  	"compare_at_price" numeric,
  	"stock" numeric DEFAULT 0,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_details" jsonb,
  	"version_category_id" integer,
  	"version_gender" "enum__products_v_version_gender" DEFAULT 'unisex',
  	"version_age_group" "enum__products_v_version_age_group" DEFAULT 'kids',
  	"version_material" varchar,
  	"version_care_instructions" varchar,
  	"version_size_guide_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_sort_priority" numeric DEFAULT 0,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "size_guides_measurements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_size_guides_measurements_size" NOT NULL,
  	"age" varchar,
  	"chest" varchar,
  	"length" varchar,
  	"waist" varchar
  );
  
  CREATE TABLE "size_guides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "orders_status_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" "enum_orders_status_history_status",
  	"payment_status" "enum_orders_status_history_payment_status",
  	"at" timestamp(3) with time zone,
  	"source" "enum_orders_status_history_source",
  	"actor" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"title" varchar NOT NULL,
  	"sku" varchar NOT NULL,
  	"size" varchar NOT NULL,
  	"color" varchar NOT NULL,
  	"qty" numeric NOT NULL,
  	"price" numeric NOT NULL
  );
  
  CREATE TABLE "orders_notifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"channel" "enum_orders_notifications_channel",
  	"audience" "enum_orders_notifications_audience",
  	"status" "enum_orders_notifications_status",
  	"provider" varchar,
  	"to" varchar,
  	"error" varchar,
  	"at" timestamp(3) with time zone
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_number" varchar NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'pending' NOT NULL,
  	"payment_method" "enum_orders_payment_method" DEFAULT 'cod' NOT NULL,
  	"payment_status" "enum_orders_payment_status" DEFAULT 'unpaid' NOT NULL,
  	"status_reason" varchar,
  	"admin_notes" varchar,
  	"customer_name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"city" "enum_orders_city" NOT NULL,
  	"area" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"landmark" varchar,
  	"customer_notes" varchar,
  	"subtotal" numeric NOT NULL,
  	"shipping" numeric NOT NULL,
  	"cod_fee" numeric DEFAULT 0 NOT NULL,
  	"total" numeric NOT NULL,
  	"shipment_courier_id" integer,
  	"shipment_courier_name" varchar,
  	"shipment_provider" varchar DEFAULT 'manual',
  	"shipment_tracking_number" varchar,
  	"shipment_tracking_url" varchar,
  	"shipment_external_id" varchar,
  	"shipment_shipping_status" "enum_orders_shipment_shipping_status" DEFAULT 'not_booked',
  	"shipment_shipment_date" timestamp(3) with time zone,
  	"shipment_delivery_date" timestamp(3) with time zone,
  	"shipment_cod_amount" numeric,
  	"shipment_notes" varchar,
  	"shipment_last_synced_at" timestamp(3) with time zone,
  	"shipment_last_sync_error" varchar,
  	"whatsapp_confirm_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "couriers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"provider" "enum_couriers_provider" DEFAULT 'manual' NOT NULL,
  	"tracking_url_template" varchar,
  	"active" boolean DEFAULT true,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"products_id" integer,
  	"tags_id" integer,
  	"size_guides_id" integer,
  	"orders_id" integer,
  	"couriers_id" integer,
  	"pages_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_city_shipping" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"city" "enum_site_settings_city_shipping_city" NOT NULL,
  	"fee" numeric NOT NULL
  );
  
  CREATE TABLE "site_settings_home_collections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"copy" varchar,
  	"category_id" integer,
  	"href" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "site_settings_home_promos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_site_settings_home_promos_icon" DEFAULT 'cod',
  	"title" varchar NOT NULL,
  	"copy" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"store_name" varchar DEFAULT 'RumiNZuni' NOT NULL,
  	"tagline" varchar DEFAULT 'Soft clothes for little explorers',
  	"logo_id" integer,
  	"announcement" varchar DEFAULT 'Cash on delivery across Pakistan · Free shipping over Rs 3,000',
  	"whatsapp" varchar DEFAULT '03001234567' NOT NULL,
  	"phone" varchar DEFAULT '03001234567',
  	"email" varchar DEFAULT 'hello@ruminzuni.com',
  	"instagram" varchar,
  	"facebook" varchar,
  	"free_shipping_threshold" numeric DEFAULT 3000,
  	"default_shipping_fee" numeric DEFAULT 250,
  	"cod_fee" numeric DEFAULT 0,
  	"hero_eyebrow" varchar DEFAULT 'Pakistan · Cash on delivery',
  	"hero_title" varchar DEFAULT 'Little outfits, made for everyday play',
  	"hero_subtitle" varchar DEFAULT 'Breathable kids wear for Pakistani weather. Order on cash on delivery — pay when it arrives.',
  	"hero_image_id" integer,
  	"hero_cta" varchar DEFAULT 'Shop new arrivals',
  	"hero_cta_link" varchar DEFAULT '/shop',
  	"hero_secondary_cta" varchar DEFAULT 'How COD works',
  	"hero_secondary_cta_link" varchar DEFAULT '/shipping',
  	"hero_overlay_title" varchar DEFAULT 'Ages newborn – 12',
  	"hero_overlay_subtitle" varchar DEFAULT 'Boys · Girls · Unisex',
  	"home_banner_title" varchar,
  	"home_banner_copy" varchar,
  	"home_banner_cta" varchar,
  	"home_banner_cta_link" varchar DEFAULT '/shop',
  	"featured_eyebrow" varchar DEFAULT 'Featured',
  	"featured_heading" varchar DEFAULT 'Little bestsellers',
  	"featured_cta" varchar DEFAULT 'View all',
  	"featured_cta_link" varchar DEFAULT '/shop',
  	"featured_empty_message" varchar DEFAULT 'Products will appear here after you seed the catalog or add items in the admin panel.',
  	"home_story_title" varchar,
  	"home_story_eyebrow" varchar,
  	"home_story_body" varchar,
  	"home_story_image_id" integer,
  	"home_story_cta" varchar,
  	"home_story_cta_link" varchar DEFAULT '/contact',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_size_guide_id_size_guides_id_fk" FOREIGN KEY ("size_guide_id") REFERENCES "public"."size_guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_images" ADD CONSTRAINT "_products_v_version_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_images" ADD CONSTRAINT "_products_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_variants" ADD CONSTRAINT "_products_v_version_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_size_guide_id_size_guides_id_fk" FOREIGN KEY ("version_size_guide_id") REFERENCES "public"."size_guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "size_guides_measurements" ADD CONSTRAINT "size_guides_measurements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."size_guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_status_history" ADD CONSTRAINT "orders_status_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_notifications" ADD CONSTRAINT "orders_notifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_shipment_courier_id_couriers_id_fk" FOREIGN KEY ("shipment_courier_id") REFERENCES "public"."couriers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_size_guides_fk" FOREIGN KEY ("size_guides_id") REFERENCES "public"."size_guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_couriers_fk" FOREIGN KEY ("couriers_id") REFERENCES "public"."couriers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_city_shipping" ADD CONSTRAINT "site_settings_city_shipping_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_home_collections" ADD CONSTRAINT "site_settings_home_collections_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_home_collections" ADD CONSTRAINT "site_settings_home_collections_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_home_collections" ADD CONSTRAINT "site_settings_home_collections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_home_promos" ADD CONSTRAINT "site_settings_home_promos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_home_story_image_id_media_id_fk" FOREIGN KEY ("home_story_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_image_idx" ON "categories" USING btree ("image_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "products_images_order_idx" ON "products_images" USING btree ("_order");
  CREATE INDEX "products_images_parent_id_idx" ON "products_images" USING btree ("_parent_id");
  CREATE INDEX "products_images_image_idx" ON "products_images" USING btree ("image_id");
  CREATE INDEX "products_variants_order_idx" ON "products_variants" USING btree ("_order");
  CREATE INDEX "products_variants_parent_id_idx" ON "products_variants" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");
  CREATE INDEX "products_size_guide_idx" ON "products" USING btree ("size_guide_id");
  CREATE INDEX "products_sort_priority_idx" ON "products" USING btree ("sort_priority");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_tags_id_idx" ON "products_rels" USING btree ("tags_id");
  CREATE INDEX "products_rels_products_id_idx" ON "products_rels" USING btree ("products_id");
  CREATE INDEX "_products_v_version_images_order_idx" ON "_products_v_version_images" USING btree ("_order");
  CREATE INDEX "_products_v_version_images_parent_id_idx" ON "_products_v_version_images" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_images_image_idx" ON "_products_v_version_images" USING btree ("image_id");
  CREATE INDEX "_products_v_version_variants_order_idx" ON "_products_v_version_variants" USING btree ("_order");
  CREATE INDEX "_products_v_version_variants_parent_id_idx" ON "_products_v_version_variants" USING btree ("_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_category_idx" ON "_products_v" USING btree ("version_category_id");
  CREATE INDEX "_products_v_version_version_size_guide_idx" ON "_products_v" USING btree ("version_size_guide_id");
  CREATE INDEX "_products_v_version_version_sort_priority_idx" ON "_products_v" USING btree ("version_sort_priority");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_tags_id_idx" ON "_products_v_rels" USING btree ("tags_id");
  CREATE INDEX "_products_v_rels_products_id_idx" ON "_products_v_rels" USING btree ("products_id");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "size_guides_measurements_order_idx" ON "size_guides_measurements" USING btree ("_order");
  CREATE INDEX "size_guides_measurements_parent_id_idx" ON "size_guides_measurements" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "size_guides_slug_idx" ON "size_guides" USING btree ("slug");
  CREATE INDEX "size_guides_updated_at_idx" ON "size_guides" USING btree ("updated_at");
  CREATE INDEX "size_guides_created_at_idx" ON "size_guides" USING btree ("created_at");
  CREATE INDEX "orders_status_history_order_idx" ON "orders_status_history" USING btree ("_order");
  CREATE INDEX "orders_status_history_parent_id_idx" ON "orders_status_history" USING btree ("_parent_id");
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX "orders_items_product_idx" ON "orders_items" USING btree ("product_id");
  CREATE INDEX "orders_notifications_order_idx" ON "orders_notifications" USING btree ("_order");
  CREATE INDEX "orders_notifications_parent_id_idx" ON "orders_notifications" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");
  CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");
  CREATE INDEX "orders_phone_idx" ON "orders" USING btree ("phone");
  CREATE INDEX "orders_shipment_shipment_courier_idx" ON "orders" USING btree ("shipment_courier_id");
  CREATE INDEX "orders_shipment_shipment_tracking_number_idx" ON "orders" USING btree ("shipment_tracking_number");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE UNIQUE INDEX "couriers_slug_idx" ON "couriers" USING btree ("slug");
  CREATE INDEX "couriers_updated_at_idx" ON "couriers" USING btree ("updated_at");
  CREATE INDEX "couriers_created_at_idx" ON "couriers" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_size_guides_id_idx" ON "payload_locked_documents_rels" USING btree ("size_guides_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_couriers_id_idx" ON "payload_locked_documents_rels" USING btree ("couriers_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_city_shipping_order_idx" ON "site_settings_city_shipping" USING btree ("_order");
  CREATE INDEX "site_settings_city_shipping_parent_id_idx" ON "site_settings_city_shipping" USING btree ("_parent_id");
  CREATE INDEX "site_settings_home_collections_order_idx" ON "site_settings_home_collections" USING btree ("_order");
  CREATE INDEX "site_settings_home_collections_parent_id_idx" ON "site_settings_home_collections" USING btree ("_parent_id");
  CREATE INDEX "site_settings_home_collections_category_idx" ON "site_settings_home_collections" USING btree ("category_id");
  CREATE INDEX "site_settings_home_collections_image_idx" ON "site_settings_home_collections" USING btree ("image_id");
  CREATE INDEX "site_settings_home_promos_order_idx" ON "site_settings_home_promos" USING btree ("_order");
  CREATE INDEX "site_settings_home_promos_parent_id_idx" ON "site_settings_home_promos" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_hero_image_idx" ON "site_settings" USING btree ("hero_image_id");
  CREATE INDEX "site_settings_home_story_image_idx" ON "site_settings" USING btree ("home_story_image_id");
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_products_id_idx" ON "site_settings_rels" USING btree ("products_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "products_images" CASCADE;
  DROP TABLE "products_variants" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_images" CASCADE;
  DROP TABLE "_products_v_version_variants" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "size_guides_measurements" CASCADE;
  DROP TABLE "size_guides" CASCADE;
  DROP TABLE "orders_status_history" CASCADE;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders_notifications" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "couriers" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_city_shipping" CASCADE;
  DROP TABLE "site_settings_home_collections" CASCADE;
  DROP TABLE "site_settings_home_promos" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_rels" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_products_variants_size";
  DROP TYPE "public"."enum_products_gender";
  DROP TYPE "public"."enum_products_age_group";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_variants_size";
  DROP TYPE "public"."enum__products_v_version_gender";
  DROP TYPE "public"."enum__products_v_version_age_group";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_size_guides_measurements_size";
  DROP TYPE "public"."enum_orders_status_history_status";
  DROP TYPE "public"."enum_orders_status_history_payment_status";
  DROP TYPE "public"."enum_orders_status_history_source";
  DROP TYPE "public"."enum_orders_notifications_channel";
  DROP TYPE "public"."enum_orders_notifications_audience";
  DROP TYPE "public"."enum_orders_notifications_status";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_payment_method";
  DROP TYPE "public"."enum_orders_payment_status";
  DROP TYPE "public"."enum_orders_city";
  DROP TYPE "public"."enum_orders_shipment_shipping_status";
  DROP TYPE "public"."enum_couriers_provider";
  DROP TYPE "public"."enum_site_settings_city_shipping_city";
  DROP TYPE "public"."enum_site_settings_home_promos_icon";`)
}
