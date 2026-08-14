import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_settings_nav_links" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "href" varchar NOT NULL
    );
    CREATE TABLE IF NOT EXISTS "site_settings_footer_shop_links" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "href" varchar NOT NULL
    );
    DO $$ BEGIN
      ALTER TABLE "site_settings_nav_links" ADD CONSTRAINT "site_settings_nav_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "site_settings_footer_shop_links" ADD CONSTRAINT "site_settings_footer_shop_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    CREATE INDEX IF NOT EXISTS "site_settings_nav_links_order_idx" ON "site_settings_nav_links" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_nav_links_parent_id_idx" ON "site_settings_nav_links" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "site_settings_footer_shop_links_order_idx" ON "site_settings_footer_shop_links" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_footer_shop_links_parent_id_idx" ON "site_settings_footer_shop_links" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "site_settings_nav_links" CASCADE;
    DROP TABLE IF EXISTS "site_settings_footer_shop_links" CASCADE;
  `)
}
