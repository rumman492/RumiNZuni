import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_departments_audience" AS ENUM('kids', 'women');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_departments_size_kind" AS ENUM('clothing', 'footwear', 'none');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_sizes_kind" AS ENUM('clothing', 'footwear', 'none');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "departments" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL UNIQUE,
      "description" varchar,
      "audience" "enum_departments_audience" DEFAULT 'kids' NOT NULL,
      "size_kind" "enum_departments_size_kind" DEFAULT 'clothing' NOT NULL,
      "uses_gender" boolean DEFAULT true,
      "uses_age" boolean DEFAULT true,
      "uses_size" boolean DEFAULT true,
      "uses_height" boolean DEFAULT true,
      "uses_color" boolean DEFAULT true,
      "uses_brand" boolean DEFAULT false,
      "uses_bag_type" boolean DEFAULT false,
      "uses_product_kind" boolean DEFAULT false,
      "uses_skin_type" boolean DEFAULT false,
      "show_in_navigation" boolean DEFAULT false,
      "storefront_visible" boolean DEFAULT true,
      "sort_order" numeric DEFAULT 0,
      "seo_title" varchar,
      "seo_description" varchar,
      "seo_noindex" boolean DEFAULT false,
      "seo_og_image_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "departments_slug_idx" ON "departments" USING btree ("slug");
  `)

  await db.execute(sql`
    ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "department_id" integer;
    ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "parent_id" integer;
    ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true;
    ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "show_in_navigation" boolean DEFAULT false;
    ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "sort_order" numeric DEFAULT 0;
    ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "seo_title" varchar;
    ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "seo_description" varchar;
    ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "seo_noindex" boolean DEFAULT false;
    ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "seo_og_image_id" integer;

    ALTER TABLE "age_groups" ADD COLUMN IF NOT EXISTS "show_in_navigation" boolean DEFAULT false;
    ALTER TABLE "age_groups" ADD COLUMN IF NOT EXISTS "seo_title" varchar;
    ALTER TABLE "age_groups" ADD COLUMN IF NOT EXISTS "seo_description" varchar;
    ALTER TABLE "age_groups" ADD COLUMN IF NOT EXISTS "seo_noindex" boolean DEFAULT false;
    ALTER TABLE "age_groups" ADD COLUMN IF NOT EXISTS "seo_og_image_id" integer;

    ALTER TABLE "sizes" ADD COLUMN IF NOT EXISTS "kind" "enum_sizes_kind" DEFAULT 'clothing';
    ALTER TABLE "sizes" ADD COLUMN IF NOT EXISTS "foot_length_cm" numeric;
    ALTER TABLE "sizes" ADD COLUMN IF NOT EXISTS "pk" varchar;
    ALTER TABLE "sizes" ALTER COLUMN "height_min_cm" DROP NOT NULL;
    ALTER TABLE "sizes" ALTER COLUMN "height_max_cm" DROP NOT NULL;

    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "department_id" integer;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brand" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "product_kind" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "bag_type" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "skin_type" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "ingredients" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "volume" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "dimensions" varchar;
    ALTER TABLE "products" ALTER COLUMN "gender" DROP DEFAULT;
    ALTER TABLE "products" ALTER COLUMN "gender" DROP NOT NULL;

    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_department_id" integer;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_brand" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_product_kind" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_bag_type" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_skin_type" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_ingredients" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_volume" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_dimensions" varchar;
  `)

  await db.execute(sql`
    INSERT INTO "departments" ("name","slug","description","audience","size_kind","uses_gender","uses_age","uses_size","uses_height","uses_color","uses_brand","uses_bag_type","uses_product_kind","uses_skin_type","show_in_navigation","storefront_visible","sort_order")
    VALUES
      ('Kids Wear','kids-wear','Boys and girls clothing from newborn to 12 years.','kids','clothing', true, true, true, true, true, false, false, false, false, false, true, 10),
      ('Baby & Kids Accessories','baby-kids-accessories','Caps, socks, bibs, bags, and everyday extras.','kids','clothing', true, true, true, false, true, false, false, false, false, true, true, 20),
      ('Kids Footwear','kids-footwear','Baby shoes, sandals, sneakers, and school shoes.','kids','footwear', true, true, true, false, true, false, false, false, false, true, true, 30),
      ('Women''s','womens','Handbags, beauty, and skincare for women.','women','none', false, false, false, false, true, true, false, false, false, true, true, 35),
      ('Women''s Handbags','womens-handbags','Handbags for women.','women','none', false, false, false, false, true, false, true, false, false, false, true, 40),
      ('Women''s Beauty','womens-beauty','Beauty for women.','women','none', false, false, false, false, false, true, false, true, false, false, true, 50),
      ('Women''s Skincare','womens-skincare','Skincare for women.','women','none', false, false, false, false, false, true, false, true, true, false, true, 60)
    ON CONFLICT ("slug") DO NOTHING;
  `)

  await db.execute(sql`
    INSERT INTO "categories" ("name","slug","description","active","show_in_navigation","sort_order","updated_at","created_at")
    VALUES
      ('Baby & Kids Accessories','baby-kids-accessories','Caps, hats, socks, hair extras, bibs, and little bags.', true, true, 20, now(), now()),
      ('Kids Footwear','kids-footwear','Soft shoes and sandals for little feet.', true, true, 30, now(), now()),
      ('Women''s','womens','Handbags, beauty, and skincare.', true, true, 40, now(), now()),
      ('Handbags','handbags','Handbags for women.', true, false, 41, now(), now()),
      ('Skincare','skincare','Skincare for women.', true, false, 43, now(), now())
    ON CONFLICT ("slug") DO NOTHING;
  `)

  await db.execute(sql`
    UPDATE "categories" c SET "department_id" = d.id
    FROM "departments" d
    WHERE (c.slug IN ('boys','girls','newborn','unisex') AND d.slug = 'kids-wear')
       OR (c.slug IN ('baby-kids-accessories','baby-accessories','kids-accessories','bags') AND d.slug = 'baby-kids-accessories')
       OR (c.slug IN ('kids-footwear','footwear') AND d.slug = 'kids-footwear')
       OR (c.slug = 'womens' AND d.slug = 'womens')
       OR (c.slug = 'handbags' AND d.slug = 'womens-handbags')
       OR (c.slug = 'beauty' AND d.slug = 'womens-beauty')
       OR (c.slug = 'skincare' AND d.slug = 'womens-skincare');

    UPDATE "categories" SET "show_in_navigation" = false, "active" = false WHERE "slug" = 'unisex';
    UPDATE "categories" SET "show_in_navigation" = false WHERE "slug" IN ('boys','girls','newborn','baby-accessories','kids-accessories','bags','footwear');
    UPDATE "categories" SET "name" = 'Beauty', "description" = 'Beauty for women.', "show_in_navigation" = false, "sort_order" = 42, "active" = true WHERE "slug" = 'beauty';

    UPDATE "categories" child SET "parent_id" = parent.id
    FROM "categories" parent
    WHERE parent.slug = 'womens' AND child.slug IN ('handbags','beauty','skincare');
  `)

  await db.execute(sql`
    UPDATE "products" p SET "category_id" = dest.id, "department_id" = d.id
    FROM "categories" src, "categories" dest, "departments" d
    WHERE p.category_id = src.id
      AND dest.slug = 'baby-kids-accessories'
      AND d.slug = 'baby-kids-accessories'
      AND src.slug IN ('baby-accessories','kids-accessories','bags');

    UPDATE "products" p SET "category_id" = dest.id, "department_id" = d.id
    FROM "categories" src, "categories" dest, "departments" d
    WHERE p.category_id = src.id
      AND dest.slug = 'kids-footwear'
      AND d.slug = 'kids-footwear'
      AND src.slug IN ('footwear');

    UPDATE "products" p SET "category_id" = dest.id, "department_id" = d.id
    FROM "categories" dest, "departments" d
    WHERE dest.slug = 'baby-kids-accessories'
      AND d.slug = 'baby-kids-accessories'
      AND p.slug IN ('gentle-baby-lotion-set','kids-lip-balm-brush');

    UPDATE "products" p SET "department_id" = d.id
    FROM "departments" d
    WHERE p.department_id IS NULL AND d.slug = 'kids-wear';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN IF EXISTS "department_id";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "brand";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "product_kind";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "bag_type";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "skin_type";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "ingredients";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "volume";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "dimensions";
    ALTER TABLE "categories" DROP COLUMN IF EXISTS "department_id";
    ALTER TABLE "categories" DROP COLUMN IF EXISTS "parent_id";
    DROP TABLE IF EXISTS "departments";
  `)
}
