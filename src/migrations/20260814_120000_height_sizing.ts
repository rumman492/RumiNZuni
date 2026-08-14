import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "age_groups" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
    slug varchar NOT NULL UNIQUE,
      "blurb" varchar,
      "storefront_visible" boolean DEFAULT true,
      "sort_order" numeric DEFAULT 0,
      "height_min_cm" numeric NOT NULL,
      "height_max_cm" numeric NOT NULL,
      "age_min_months" numeric,
      "age_max_months" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "age_groups_slug_idx" ON "age_groups" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "age_groups_updated_at_idx" ON "age_groups" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "age_groups_created_at_idx" ON "age_groups" USING btree ("created_at");

    CREATE TABLE IF NOT EXISTS "sizes" (
      "id" serial PRIMARY KEY NOT NULL,
      "code" varchar NOT NULL UNIQUE,
      "label" varchar NOT NULL,
      "age_label" varchar,
      "storefront_visible" boolean DEFAULT true,
      "sort_order" numeric DEFAULT 0,
      "height_min_cm" numeric NOT NULL,
      "height_max_cm" numeric NOT NULL,
      "chest_min_cm" numeric,
      "chest_max_cm" numeric,
      "waist_min_cm" numeric,
      "waist_max_cm" numeric,
      "age_min_months" numeric,
      "age_max_months" numeric,
      "eu" varchar,
      "uk" varchar,
      "us" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "sizes_code_idx" ON "sizes" USING btree ("code");
    CREATE INDEX IF NOT EXISTS "sizes_updated_at_idx" ON "sizes" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "sizes_created_at_idx" ON "sizes" USING btree ("created_at");

    CREATE TABLE IF NOT EXISTS "sizes_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "age_groups_id" integer
    );
    CREATE INDEX IF NOT EXISTS "sizes_rels_order_idx" ON "sizes_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "sizes_rels_parent_idx" ON "sizes_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "sizes_rels_path_idx" ON "sizes_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "sizes_rels_age_groups_id_idx" ON "sizes_rels" USING btree ("age_groups_id");
  `)

  await db.execute(sql`
    INSERT INTO "age_groups" ("name","slug","blurb","storefront_visible","sort_order","height_min_cm","height_max_cm","age_min_months","age_max_months")
    VALUES
      ('Newborn','newborn','Rompers, bodysuits, sets, and sleepsuits', true, 10, 46, 62, 0, 3),
      ('Baby','baby','Sets, rompers, and casual wear', true, 20, 62, 80, 3, 12),
      ('Toddler','toddler','T-shirts, sets, frocks, and trousers', true, 30, 80, 104, 12, 36),
      ('Little Kids','little-kids','Casual, party, ethnic, and sets', true, 40, 98, 116, 36, 72),
      ('Kids','kids','T-shirts, shirts, jeans, dresses, and sets', true, 50, 116, 134, 72, 108),
      ('Big Kids','big-kids','Fashion, casual, and sportswear', true, 60, 134, 158, 108, 144),
      ('Pre-Teen','pre-teen','More mature kids fashion', false, 70, 152, 164, 144, 168),
      ('Teen','teen','Older sizes for later', false, 80, 164, 176, 168, 192)
    ON CONFLICT ("slug") DO NOTHING;
  `)

  await db.execute(sql`
    INSERT INTO "sizes" ("code","label","age_label","storefront_visible","sort_order","height_min_cm","height_max_cm","chest_min_cm","chest_max_cm","waist_min_cm","waist_max_cm","age_min_months","age_max_months","eu","uk","us")
    VALUES
      ('newborn','Newborn','0–1 months', true, 10, 46, 56, 36, 40, 36, 38, 0, 1, '50', 'newborn', 'NB'),
      ('0-3m','0–3 months','0–3 months', true, 20, 50, 62, 38, 42, 38, 42, 0, 3, '56', '0-3m', '0-3M'),
      ('3-6m','3–6 months','3–6 months', true, 30, 62, 68, 42, 44, 42, 44, 3, 6, '62', '3-6m', '3-6M'),
      ('6-9m','6–9 months','6–9 months', true, 40, 68, 74, 44, 46, 44, 46, 6, 9, '68', '6-9m', '6-9M'),
      ('9-12m','9–12 months','9–12 months', true, 50, 74, 80, 46, 48, 46, 48, 9, 12, '74', '9-12m', '9-12M'),
      ('12-18m','12–18 months','12–18 months', true, 60, 80, 86, 48, 50, 48, 50, 12, 18, '80', '12-18m', '12-18M'),
      ('18-24m','18–24 months','18–24 months', true, 70, 86, 92, 50, 52, 50, 52, 18, 24, '86', '18-24m', '18-24M'),
      ('2y','2 years','1–3 years', true, 80, 92, 98, 52, 54, 51, 53, 24, 36, '92', '2y', '2T'),
      ('3y','3 years','2–4 years', true, 90, 98, 104, 54, 56, 52, 54, 36, 48, '98', '3y', '3T'),
      ('4y','4 years','3–5 years', true, 100, 104, 110, 56, 58, 53, 55, 48, 60, '104', '4y', '4'),
      ('5y','5 years','4–6 years', true, 110, 110, 116, 58, 60, 54, 56, 60, 72, '110', '5y', '5'),
      ('6y','6–7 years','5–7 years', true, 120, 116, 122, 60, 62, 55, 57, 72, 84, '116', '6y', '6'),
      ('7-8y','7–8 years','6–9 years', true, 130, 122, 134, 62, 66, 56, 60, 84, 108, '128', '7-8y', '7-8'),
      ('9-10y','9–10 years','8–11 years', true, 140, 134, 146, 66, 72, 60, 64, 108, 132, '140', '9-10y', '10'),
      ('11-12y','11–12 years','10–13 years', true, 150, 146, 158, 72, 78, 64, 68, 132, 156, '152', '11-12y', '12'),
      ('13-14y','13–14 years','12–14 years', false, 160, 158, 164, 78, 84, 66, 72, 144, 168, '158', '13-14y', '14'),
      ('14-16y','14–16 years','14–16 years', false, 170, 164, 176, 84, 90, 70, 76, 168, 192, '164', '14-16y', '16')
    ON CONFLICT ("code") DO NOTHING;
  `)

  await db.execute(sql`
    INSERT INTO "sizes_rels" ("order","parent_id","path","age_groups_id")
    SELECT 0, s.id, 'ageGroups', g.id
    FROM "sizes" s
    JOIN "age_groups" g ON
      (s.code IN ('newborn') AND g.slug = 'newborn')
      OR (s.code IN ('0-3m') AND g.slug IN ('newborn','baby'))
      OR (s.code IN ('3-6m','6-9m','9-12m') AND g.slug = 'baby')
      OR (s.code IN ('12-18m','18-24m','2y') AND g.slug = 'toddler')
      OR (s.code IN ('3y') AND g.slug IN ('toddler','little-kids'))
      OR (s.code IN ('4y','5y') AND g.slug = 'little-kids')
      OR (s.code IN ('6y','7-8y') AND g.slug = 'kids')
      OR (s.code IN ('9-10y','11-12y') AND g.slug = 'big-kids')
      OR (s.code IN ('13-14y') AND g.slug = 'pre-teen')
      OR (s.code IN ('14-16y') AND g.slug = 'teen')
    WHERE NOT EXISTS (
      SELECT 1 FROM "sizes_rels" r
      WHERE r.parent_id = s.id AND r.age_groups_id = g.id AND r.path = 'ageGroups'
    );
  `)

  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "age_group_id" integer;
    UPDATE "products" p
    SET "age_group_id" = g.id
    FROM "age_groups" g
    WHERE p."age_group_id" IS NULL
      AND g.slug = CASE p."age_group"::text
        WHEN 'newborn' THEN 'newborn'
        WHEN 'infant' THEN 'baby'
        WHEN 'toddler' THEN 'toddler'
        ELSE 'kids'
      END;
    UPDATE "products" SET "age_group_id" = (SELECT id FROM "age_groups" WHERE slug = 'kids' LIMIT 1)
    WHERE "age_group_id" IS NULL;
    ALTER TABLE "products" DROP COLUMN IF EXISTS "age_group";
    CREATE INDEX IF NOT EXISTS "products_age_group_idx" ON "products" USING btree ("age_group_id");
  `)

  await db.execute(sql`
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_age_group_id" integer;
    UPDATE "_products_v" p
    SET "version_age_group_id" = g.id
    FROM "age_groups" g
    WHERE p."version_age_group_id" IS NULL
      AND g.slug = CASE p."version_age_group"::text
        WHEN 'newborn' THEN 'newborn'
        WHEN 'infant' THEN 'baby'
        WHEN 'toddler' THEN 'toddler'
        ELSE 'kids'
      END;
    ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_age_group";
  `)

  await db.execute(sql`
    ALTER TABLE "products_variants" ALTER COLUMN "size" TYPE varchar USING "size"::text;
    ALTER TABLE "_products_v_version_variants" ALTER COLUMN "size" TYPE varchar USING "size"::text;
    ALTER TABLE "size_guides_measurements" ALTER COLUMN "size" TYPE varchar USING "size"::text;
  `)

  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "age_groups_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "sizes_id" integer;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_age_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("age_groups_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_sizes_id_idx" ON "payload_locked_documents_rels" USING btree ("sizes_id");
  `)

  await db.execute(sql`
    INSERT INTO "categories" ("name","slug","description","updated_at","created_at")
    SELECT v.name, v.slug, v.description, now(), now()
    FROM (VALUES
      ('Baby accessories','baby-accessories','Bibs, hats, and everyday baby extras. Cash on delivery across Pakistan.'),
      ('Kids accessories','kids-accessories','Hair, hats, and play extras for kids. Cash on delivery across Pakistan.'),
      ('Footwear','footwear','Soft shoes and sandals for little feet. Cash on delivery across Pakistan.'),
      ('Bags','bags','School bags and little carry-alls. Cash on delivery across Pakistan.'),
      ('Beauty','beauty','Gentle kids and baby care. Cash on delivery across Pakistan.')
    ) AS v(name, slug, description)
    WHERE NOT EXISTS (SELECT 1 FROM "categories" c WHERE c.slug = v.slug);
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "sizes_rels" ADD CONSTRAINT "sizes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sizes"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "sizes_rels" ADD CONSTRAINT "sizes_rels_age_groups_fk" FOREIGN KEY ("age_groups_id") REFERENCES "public"."age_groups"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "products" ADD CONSTRAINT "products_age_group_id_age_groups_id_fk" FOREIGN KEY ("age_group_id") REFERENCES "public"."age_groups"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_age_groups_fk" FOREIGN KEY ("age_groups_id") REFERENCES "public"."age_groups"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sizes_fk" FOREIGN KEY ("sizes_id") REFERENCES "public"."sizes"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)

  await db.execute(sql`
    DROP TYPE IF EXISTS "public"."enum_products_age_group";
    DROP TYPE IF EXISTS "public"."enum__products_v_version_age_group";
    DROP TYPE IF EXISTS "public"."enum_products_variants_size";
    DROP TYPE IF EXISTS "public"."enum__products_v_version_variants_size";
    DROP TYPE IF EXISTS "public"."enum_size_guides_measurements_size";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN IF EXISTS "age_group_id";
    ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_age_group_id";
    DROP TABLE IF EXISTS "sizes_rels" CASCADE;
    DROP TABLE IF EXISTS "sizes" CASCADE;
    DROP TABLE IF EXISTS "age_groups" CASCADE;
  `)
}
