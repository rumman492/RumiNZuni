import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ALTER COLUMN "whatsapp" DROP DEFAULT;
    ALTER TABLE "site_settings" ALTER COLUMN "whatsapp" DROP NOT NULL;
    ALTER TABLE "site_settings" ALTER COLUMN "phone" DROP DEFAULT;
    ALTER TABLE "site_settings" ALTER COLUMN "email" DROP DEFAULT;
    UPDATE "site_settings"
    SET
      "whatsapp" = CASE WHEN "whatsapp" IN ('03001234567', '0300 1234567') THEN NULL ELSE "whatsapp" END,
      "phone" = CASE WHEN "phone" IN ('03001234567', '0300 1234567') THEN NULL ELSE "phone" END,
      "email" = CASE WHEN "email" IN ('hello@ruminzuni.com') THEN NULL ELSE "email" END;
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Do not restore placeholder phone numbers or emails.
}
