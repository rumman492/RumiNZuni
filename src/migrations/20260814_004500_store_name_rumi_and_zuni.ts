import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ALTER COLUMN "store_name" SET DEFAULT 'Rumi & Zuni';
    UPDATE "site_settings"
    SET
      "store_name" = CASE WHEN "store_name" = 'RumiNZuni' THEN 'Rumi & Zuni' ELSE "store_name" END,
      "home_story_body" = REPLACE("home_story_body", 'RumiNZuni', 'Rumi & Zuni');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ALTER COLUMN "store_name" SET DEFAULT 'RumiNZuni';
    UPDATE "site_settings"
    SET
      "store_name" = CASE WHEN "store_name" = 'Rumi & Zuni' THEN 'RumiNZuni' ELSE "store_name" END,
      "home_story_body" = REPLACE("home_story_body", 'Rumi & Zuni', 'RumiNZuni');
  `)
}
