import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "users_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "media_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "departments_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "categories_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "products_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "tags_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "catalog_options_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "age_groups_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "sizes_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "size_guides_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "orders_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "couriers_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "pages_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_departments_id_idx" ON "payload_locked_documents_rels" USING btree ("departments_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_catalog_options_id_idx" ON "payload_locked_documents_rels" USING btree ("catalog_options_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_age_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("age_groups_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_sizes_id_idx" ON "payload_locked_documents_rels" USING btree ("sizes_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_size_guides_id_idx" ON "payload_locked_documents_rels" USING btree ("size_guides_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_couriers_id_idx" ON "payload_locked_documents_rels" USING btree ("couriers_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_catalog_options_fk" FOREIGN KEY ("catalog_options_id") REFERENCES "public"."catalog_options"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_age_groups_fk" FOREIGN KEY ("age_groups_id") REFERENCES "public"."age_groups"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sizes_fk" FOREIGN KEY ("sizes_id") REFERENCES "public"."sizes"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_size_guides_fk" FOREIGN KEY ("size_guides_id") REFERENCES "public"."size_guides"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_couriers_fk" FOREIGN KEY ("couriers_id") REFERENCES "public"."couriers"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)

  await db.execute(sql`
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "users_id" integer;
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "media_id" integer;
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "departments_id" integer;
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "categories_id" integer;
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "products_id" integer;
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "tags_id" integer;
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "catalog_options_id" integer;
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "age_groups_id" integer;
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "sizes_id" integer;
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "size_guides_id" integer;
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "orders_id" integer;
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "couriers_id" integer;
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "pages_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_media_id_idx" ON "payload_preferences_rels" USING btree ("media_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_departments_id_idx" ON "payload_preferences_rels" USING btree ("departments_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_categories_id_idx" ON "payload_preferences_rels" USING btree ("categories_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_products_id_idx" ON "payload_preferences_rels" USING btree ("products_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_tags_id_idx" ON "payload_preferences_rels" USING btree ("tags_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_catalog_options_id_idx" ON "payload_preferences_rels" USING btree ("catalog_options_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_age_groups_id_idx" ON "payload_preferences_rels" USING btree ("age_groups_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_sizes_id_idx" ON "payload_preferences_rels" USING btree ("sizes_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_size_guides_id_idx" ON "payload_preferences_rels" USING btree ("size_guides_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_orders_id_idx" ON "payload_preferences_rels" USING btree ("orders_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_couriers_id_idx" ON "payload_preferences_rels" USING btree ("couriers_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_pages_id_idx" ON "payload_preferences_rels" USING btree ("pages_id");

    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_catalog_options_fk" FOREIGN KEY ("catalog_options_id") REFERENCES "public"."catalog_options"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_age_groups_fk" FOREIGN KEY ("age_groups_id") REFERENCES "public"."age_groups"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_sizes_fk" FOREIGN KEY ("sizes_id") REFERENCES "public"."sizes"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_size_guides_fk" FOREIGN KEY ("size_guides_id") REFERENCES "public"."size_guides"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_couriers_fk" FOREIGN KEY ("couriers_id") REFERENCES "public"."couriers"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Keep columns so /admin does not lose the lock-table FKs Payload 3 selects.
}
