import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    INSERT INTO "products" (
      "title", "slug", "description", "category_id", "department_id",
      "brand", "product_kind", "bag_type", "skin_type", "volume", "material", "dimensions",
      "fragrance_type", "fragrance_family", "featured", "sort_priority", "_status", "updated_at", "created_at"
    )
    SELECT
      v.title, v.slug, v.description, c.id, d.id,
      NULLIF(v.brand, ''), NULLIF(v.product_kind, ''), NULLIF(v.bag_type, ''), NULLIF(v.skin_type, ''),
      NULLIF(v.volume, ''), NULLIF(v.material, ''), NULLIF(v.dimensions, ''),
      NULLIF(v.fragrance_type, ''), NULLIF(v.fragrance_family, ''),
      false, 10, 'published', now(), now()
    FROM (
      VALUES
        ('Sage everyday tote', 'womens-sage-tote', 'Sample tote. Replace in Admin → Products.', 'handbags', 'womens-handbags', '', '', 'tote', '', '', 'Sample vegan leather', '30 × 22 × 10 cm', '', ''),
        ('Coral crossbody', 'womens-coral-crossbody', 'Sample crossbody. Replace in Admin → Products.', 'handbags', 'womens-handbags', '', '', 'crossbody', '', '', 'Sample vegan leather', '22 × 16 × 8 cm', '', ''),
        ('Blush evening clutch', 'womens-blush-clutch', 'Sample clutch. Replace in Admin → Products.', 'handbags', 'womens-handbags', '', '', 'clutch', '', '', 'Sample vegan leather', '24 × 14 × 6 cm', '', ''),
        ('Navy work satchel', 'womens-navy-satchel', 'Sample satchel. Replace in Admin → Products.', 'handbags', 'womens-handbags', '', '', 'satchel', '', '', 'Sample vegan leather', '28 × 20 × 10 cm', '', ''),
        ('Mini blush backpack', 'womens-mini-backpack', 'Sample backpack. Replace in Admin → Products.', 'handbags', 'womens-handbags', '', '', 'backpack', '', '', 'Sample vegan leather', '26 × 32 × 12 cm', '', ''),
        ('Ivory shoulder bag', 'womens-ivory-shoulder', 'Sample shoulder bag. Replace in Admin → Products.', 'handbags', 'womens-handbags', '', '', 'shoulder', '', '', 'Sample vegan leather', '28 × 18 × 8 cm', '', ''),
        ('Market tote sample', 'womens-market-tote', 'Sample tote. Replace in Admin → Products.', 'handbags', 'womens-handbags', '', '', 'tote', '', '', 'Sample vegan leather', '32 × 24 × 12 cm', '', ''),
        ('City sling sample', 'womens-city-sling', 'Sample crossbody. Replace in Admin → Products.', 'handbags', 'womens-handbags', '', '', 'crossbody', '', '', 'Sample vegan leather', '20 × 14 × 7 cm', '', ''),
        ('Foldover clutch sample', 'womens-foldover-clutch', 'Sample clutch. Replace in Admin → Products.', 'handbags', 'womens-handbags', '', '', 'clutch', '', '', 'Sample vegan leather', '22 × 12 × 5 cm', '', ''),

        ('Lipstick & compact', 'womens-lipstick-compact', 'Sample makeup. Replace in Admin → Products.', 'beauty', 'womens-beauty', 'Sample', 'lipstick', '', '', '', '', '', '', ''),
        ('Mascara & brush', 'womens-mascara-brush', 'Sample makeup. Replace in Admin → Products.', 'beauty', 'womens-beauty', 'Sample', 'mascara', '', '', '', '', '', '', ''),
        ('Kohl & lip gloss', 'womens-kohl-gloss', 'Sample makeup. Replace in Admin → Products.', 'beauty', 'womens-beauty', 'Sample', 'kohl', '', '', '', '', '', '', ''),
        ('Everyday lipstick sample', 'womens-everyday-lipstick', 'Sample makeup. Replace in Admin → Products.', 'beauty', 'womens-beauty', 'Sample', 'lipstick', '', '', '', '', '', '', ''),
        ('Soft blush compact', 'womens-soft-blush', 'Sample makeup. Replace in Admin → Products.', 'beauty', 'womens-beauty', 'Sample', 'blush', '', '', '', '', '', '', ''),
        ('Length mascara sample', 'womens-length-mascara', 'Sample makeup. Replace in Admin → Products.', 'beauty', 'womens-beauty', 'Sample', 'mascara', '', '', '', '', '', '', ''),
        ('Brow pencil sample', 'womens-brow-pencil', 'Sample makeup. Replace in Admin → Products.', 'beauty', 'womens-beauty', 'Sample', 'brow', '', '', '', '', '', '', ''),
        ('Nude gloss sample', 'womens-nude-gloss', 'Sample makeup. Replace in Admin → Products.', 'beauty', 'womens-beauty', 'Sample', 'gloss', '', '', '', '', '', '', ''),
        ('Mini makeup kit', 'womens-mini-makeup-kit', 'Sample makeup. Replace in Admin → Products.', 'beauty', 'womens-beauty', 'Sample', 'kit', '', '', '', '', '', '', ''),

        ('Daily face cream', 'womens-face-cream', 'Sample skincare. Replace in Admin → Products.', 'skincare', 'womens-skincare', 'Sample', 'moisturizer', '', 'all', '50 ml', '', '', '', ''),
        ('Gentle cleanser', 'womens-cleanser', 'Sample skincare. Replace in Admin → Products.', 'skincare', 'womens-skincare', 'Sample', 'cleanser', '', 'combination', '100 ml', '', '', '', ''),
        ('Overnight serum', 'womens-serum', 'Sample skincare. Replace in Admin → Products.', 'skincare', 'womens-skincare', 'Sample', 'serum', '', 'dry', '30 ml', '', '', '', ''),
        ('Day moisturizer sample', 'womens-day-moisturizer', 'Sample skincare. Replace in Admin → Products.', 'skincare', 'womens-skincare', 'Sample', 'moisturizer', '', 'normal', '50 ml', '', '', '', ''),
        ('Foam cleanser sample', 'womens-foam-cleanser', 'Sample skincare. Replace in Admin → Products.', 'skincare', 'womens-skincare', 'Sample', 'cleanser', '', 'oily', '100 ml', '', '', '', ''),
        ('Vitamin serum sample', 'womens-vitamin-serum', 'Sample skincare. Replace in Admin → Products.', 'skincare', 'womens-skincare', 'Sample', 'serum', '', 'all', '30 ml', '', '', '', ''),
        ('Night cream sample', 'womens-night-cream', 'Sample skincare. Replace in Admin → Products.', 'skincare', 'womens-skincare', 'Sample', 'moisturizer', '', 'dry', '50 ml', '', '', '', ''),
        ('Micellar water sample', 'womens-micellar-water', 'Sample skincare. Replace in Admin → Products.', 'skincare', 'womens-skincare', 'Sample', 'cleanser', '', 'sensitive', '200 ml', '', '', '', ''),
        ('Eye serum sample', 'womens-eye-serum', 'Sample skincare. Replace in Admin → Products.', 'skincare', 'womens-skincare', 'Sample', 'serum', '', 'all', '15 ml', '', '', '', ''),

        ('Floral eau de parfum', 'womens-floral-edp', 'Sample perfume. Replace in Admin → Products.', 'perfumes', 'womens-perfumes', 'Sample', 'Eau de Parfum', '', '', '', '', '', 'Eau de Parfum', 'Floral'),
        ('Citrus body mist', 'womens-citrus-mist', 'Sample perfume. Replace in Admin → Products.', 'perfumes', 'womens-perfumes', 'Sample', 'Body Mist', '', '', '', '', '', 'Body Mist', 'Citrus'),
        ('Amber perfume oil', 'womens-amber-oil', 'Sample perfume. Replace in Admin → Products.', 'perfumes', 'womens-perfumes', 'Sample', 'Perfume Oil', '', '', '', '', '', 'Perfume Oil', 'Amber'),
        ('Woody eau de toilette', 'womens-woody-edt', 'Sample perfume. Replace in Admin → Products.', 'perfumes', 'womens-perfumes', 'Sample', 'Eau de Toilette', '', '', '', '', '', 'Eau de Toilette', 'Woody'),
        ('Musk eau de parfum', 'womens-musk-edp', 'Sample perfume. Replace in Admin → Products.', 'perfumes', 'womens-perfumes', 'Sample', 'Eau de Parfum', '', '', '', '', '', 'Eau de Parfum', 'Musky'),
        ('Rose body mist', 'womens-rose-mist', 'Sample perfume. Replace in Admin → Products.', 'perfumes', 'womens-perfumes', 'Sample', 'Body Mist', '', '', '', '', '', 'Body Mist', 'Floral'),
        ('Fresh cologne sample', 'womens-fresh-edc', 'Sample perfume. Replace in Admin → Products.', 'perfumes', 'womens-perfumes', 'Sample', 'Eau de Cologne', '', '', '', '', '', 'Eau de Cologne', 'Fresh'),
        ('Gourmand perfume oil', 'womens-gourmand-oil', 'Sample perfume. Replace in Admin → Products.', 'perfumes', 'womens-perfumes', 'Sample', 'Perfume Oil', '', '', '', '', '', 'Perfume Oil', 'Gourmand'),
        ('Fragrance set sample', 'womens-fragrance-set', 'Sample perfume. Replace in Admin → Products.', 'perfumes', 'womens-perfumes', 'Sample', 'Fragrance Sets', '', '', '', '', '', 'Fragrance Sets', 'Floral')
    ) AS v(title, slug, description, cat_slug, dept_slug, brand, product_kind, bag_type, skin_type, volume, material, dimensions, fragrance_type, fragrance_family)
    JOIN "categories" c ON c.slug = v.cat_slug
    JOIN "departments" d ON d.slug = v.dept_slug
    WHERE NOT EXISTS (SELECT 1 FROM "products" p WHERE p.slug = v.slug);

    INSERT INTO "products_variants" ("_order", "_parent_id", "id", "sku", "size", "color", "price", "stock")
    SELECT 1, p.id, 'wv-' || p.slug, 'RNZ-' || p.id || '-OS', 'onesize',
      CASE
        WHEN p.slug LIKE '%coral%' OR p.slug LIKE '%city%' THEN 'Coral'
        WHEN p.slug LIKE '%blush%' OR p.slug LIKE '%clutch%' THEN 'Blush'
        WHEN p.slug LIKE '%navy%' THEN 'Navy'
        WHEN p.slug LIKE '%ivory%' THEN 'Ivory'
        WHEN c.slug = 'beauty' THEN 'Nude'
        WHEN c.slug IN ('skincare', 'perfumes') THEN 'None'
        ELSE 'Sage'
      END,
      CASE
        WHEN c.slug = 'handbags' THEN 2990
        WHEN c.slug = 'beauty' THEN 1290
        WHEN c.slug = 'skincare' THEN 1890
        ELSE 2490
      END,
      8
    FROM "products" p
    JOIN "categories" c ON c.id = p.category_id
    WHERE p.slug LIKE 'womens-%'
      AND NOT EXISTS (SELECT 1 FROM "products_variants" pv WHERE pv."_parent_id" = p.id);

    INSERT INTO "products_variants" ("_order", "_parent_id", "id", "sku", "size", "color", "price", "stock")
    SELECT 2, p.id, 'wv2-' || p.slug, 'RNZ-' || p.id || '-100', '100ml', 'None', 3290, 4
    FROM "products" p
    JOIN "categories" c ON c.id = p.category_id
    WHERE c.slug = 'perfumes' AND p.slug LIKE 'womens-%'
      AND NOT EXISTS (SELECT 1 FROM "products_variants" pv WHERE pv.id = 'wv2-' || p.slug);

    UPDATE "products" SET "_status" = 'published' WHERE "slug" LIKE 'womens-%' AND "_status" IS DISTINCT FROM 'published';

    INSERT INTO "_products_v" (
      "parent_id", "version_title", "version_slug", "version_description",
      "version_category_id", "version_department_id", "version_brand", "version_product_kind",
      "version_bag_type", "version_skin_type", "version_volume", "version_material", "version_dimensions",
      "version_fragrance_type", "version_fragrance_family", "version_featured", "version_sort_priority",
      "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "latest"
    )
    SELECT
      p.id, p.title, p.slug, p.description,
      p.category_id, p.department_id, p.brand, p.product_kind,
      p.bag_type, p.skin_type, p.volume, p.material, p.dimensions,
      p.fragrance_type, p.fragrance_family, p.featured, p.sort_priority,
      'published', p.updated_at, p.created_at, now(), now(), true
    FROM "products" p
    WHERE p.slug LIKE 'womens-%'
      AND NOT EXISTS (SELECT 1 FROM "_products_v" v WHERE v."parent_id" = p.id);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "products_variants" WHERE "id" LIKE 'wv-%' OR "id" LIKE 'wv2-%';
    DELETE FROM "products" WHERE "slug" LIKE 'womens-%';
  `)
}
