import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ALTER COLUMN "hero_title" SET DEFAULT 'Little outfits, made for everyday adventures.';

    UPDATE "site_settings"
    SET "hero_title" = 'Little outfits, made for everyday adventures.'
    WHERE "hero_title" = 'Little outfits, made for everyday play';

    UPDATE "site_settings"
    SET "hero_subtitle" = 'Kids wear from newborn to 12 years — and a quieter corner for her, with handbags, makeup, skincare, and perfumes. Pay cash on delivery when it arrives.'
    WHERE "hero_subtitle" = 'Breathable kids wear for Pakistani weather. Order on cash on delivery — pay when it arrives.';

    UPDATE "site_settings"
    SET
      "hero_secondary_cta" = 'Shop Women''s',
      "hero_secondary_cta_link" = '/shop/womens'
    WHERE "hero_secondary_cta" = 'How COD works';

    UPDATE "site_settings"
    SET "hero_overlay_title" = 'Kidswear first — plus a little for her'
    WHERE "hero_overlay_title" IN ('Ages newborn – 12', 'Family style, simply chosen');

    UPDATE "site_settings"
    SET "hero_overlay_subtitle" = 'Handbags · Makeup · Skincare · Perfumes'
    WHERE "hero_overlay_subtitle" IN ('Boys · Girls · Unisex', 'Kids · Handbags · Beauty');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ALTER COLUMN "hero_title" SET DEFAULT 'Little outfits, made for everyday play';

    UPDATE "site_settings"
    SET "hero_title" = 'Little outfits, made for everyday play'
    WHERE "hero_title" = 'Little outfits, made for everyday adventures.';

    UPDATE "site_settings"
    SET "hero_subtitle" = 'Breathable kids wear for Pakistani weather. Order on cash on delivery — pay when it arrives.'
    WHERE "hero_subtitle" = 'Kids wear from newborn to 12 years — and a quieter corner for her, with handbags, makeup, skincare, and perfumes. Pay cash on delivery when it arrives.';

    UPDATE "site_settings"
    SET
      "hero_secondary_cta" = 'How COD works',
      "hero_secondary_cta_link" = '/shipping'
    WHERE "hero_secondary_cta" = 'Shop Women''s';

    UPDATE "site_settings"
    SET "hero_overlay_title" = 'Ages newborn – 12'
    WHERE "hero_overlay_title" = 'Kidswear first — plus a little for her';

    UPDATE "site_settings"
    SET "hero_overlay_subtitle" = 'Boys · Girls · Unisex'
    WHERE "hero_overlay_subtitle" = 'Handbags · Makeup · Skincare · Perfumes';
  `)
}
