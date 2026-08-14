import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_catalog_options_kind" AS ENUM('bag-type', 'skin-type', 'skin-concern', 'fragrance-family', 'fragrance-type', 'finish', 'skin-tone', 'product-kind');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS "catalog_options" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "slug" varchar,
      "kind" "enum_catalog_options_kind" NOT NULL,
      "active" boolean DEFAULT true,
      "sort_order" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "catalog_options_slug_idx" ON "catalog_options" USING btree ("slug");

    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "pattern" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "strap_type" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "closure_type" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "compartments" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "shade" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "finish" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "skin_tone" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "formulation" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "skin_concern" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "key_ingredients" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "spf" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "fragrance_type" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "fragrance_family" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "top_notes" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "middle_notes" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "base_notes" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "longevity" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "usage_instructions" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "warnings" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "manufacturer" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "country_of_origin" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "batch_expiry" varchar;
    ALTER TABLE "products_variants" ADD COLUMN IF NOT EXISTS "shade_code" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_pattern" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_strap_type" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_closure_type" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_compartments" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_shade" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_finish" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_skin_tone" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_formulation" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_skin_concern" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_key_ingredients" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_spf" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_fragrance_type" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_fragrance_family" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_top_notes" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_middle_notes" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_base_notes" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_longevity" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_usage_instructions" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_warnings" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_manufacturer" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_country_of_origin" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_batch_expiry" varchar;

    INSERT INTO "departments" ("name","slug","description","audience","size_kind","uses_gender","uses_age","uses_size","uses_height","uses_color","uses_brand","uses_bag_type","uses_product_kind","uses_skin_type","show_in_navigation","storefront_visible","sort_order")
    VALUES
      ('Women''s Perfumes','womens-perfumes','Perfumes and mists for women.','women','none', false, false, false, false, false, true, false, true, false, false, true, 70)
    ON CONFLICT ("slug") DO NOTHING;

    INSERT INTO "categories" ("name","slug","description","active","show_in_navigation","sort_order","updated_at","created_at")
    VALUES
      ('Beauty & Personal Care','beauty-care','Makeup, skincare, and perfumes for women.', true, false, 42, now(), now()),
      ('Perfumes','perfumes','Perfumes, mists, and fragrance oils for women.', true, false, 45, now(), now()),
      ('Hair Care','hair-care','Shampoo, oils, and styling. Hidden until you tick Active.', false, false, 46, now(), now()),
      ('Body Care','body-care','Body lotion, wash, and scrubs. Hidden until you tick Active.', false, false, 47, now(), now()),
      ('Beauty Tools','beauty-tools','Brushes and tools. Hidden until you tick Active.', false, false, 48, now(), now())
    ON CONFLICT ("slug") DO NOTHING;

    UPDATE "categories" SET "name" = 'Makeup', "description" = 'Makeup for women. Existing /shop/beauty URLs stay the same.', "sort_order" = 43 WHERE "slug" = 'beauty';
    UPDATE "departments" SET "name" = 'Women''s Beauty', "description" = 'Makeup for women. Cash on delivery across Pakistan.' WHERE "slug" = 'womens-beauty';

    UPDATE "categories" c SET "department_id" = d.id
    FROM "departments" d
    WHERE (c.slug = 'beauty-care' AND d.slug = 'womens')
       OR (c.slug = 'perfumes' AND d.slug = 'womens-perfumes')
       OR (c.slug IN ('hair-care','beauty-tools') AND d.slug = 'womens-beauty')
       OR (c.slug = 'body-care' AND d.slug = 'womens-skincare');

    UPDATE "categories" child SET "parent_id" = parent.id
    FROM "categories" parent
    WHERE parent.slug = 'womens' AND child.slug IN ('handbags','beauty-care');

    UPDATE "categories" child SET "parent_id" = parent.id
    FROM "categories" parent
    WHERE parent.slug = 'beauty-care' AND child.slug IN ('beauty','skincare','perfumes','hair-care','body-care','beauty-tools');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_variants" DROP COLUMN IF EXISTS "shade_code";
    DROP TABLE IF EXISTS "catalog_options" CASCADE;
  `)
}
