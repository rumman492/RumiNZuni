import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "categories"
    SET "description" = 'Makeup for everyday colour and special evenings.'
    WHERE "slug" = 'beauty';

    UPDATE "departments"
    SET "description" = 'Makeup for everyday colour and special evenings.'
    WHERE "slug" = 'womens-beauty';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "categories"
    SET "description" = 'Makeup for women. Existing /shop/beauty URLs stay the same.'
    WHERE "slug" = 'beauty';

    UPDATE "departments"
    SET "description" = 'Makeup for women. Cash on delivery across Pakistan.'
    WHERE "slug" = 'womens-beauty';
  `)
}
