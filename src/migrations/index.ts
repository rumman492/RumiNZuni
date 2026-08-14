import * as migration_20260813_183755_initial from './20260813_183755_initial';
import * as migration_20260813_184500_clear_placeholder_contacts from './20260813_184500_clear_placeholder_contacts';
import * as migration_20260814_004500_store_name_rumi_and_zuni from './20260814_004500_store_name_rumi_and_zuni';
import * as migration_20260814_120000_height_sizing from './20260814_120000_height_sizing';
import * as migration_20260814_180000_catalog_taxonomy from './20260814_180000_catalog_taxonomy';
import * as migration_20260814_193000_storefront_nav from './20260814_193000_storefront_nav';
import * as migration_20260814_200000_womens_catalog from './20260814_200000_womens_catalog';
import * as migration_20260814_220000_womens_sample_products from './20260814_220000_womens_sample_products';

export const migrations = [
  {
    up: migration_20260813_183755_initial.up,
    down: migration_20260813_183755_initial.down,
    name: '20260813_183755_initial'
  },
  {
    up: migration_20260813_184500_clear_placeholder_contacts.up,
    down: migration_20260813_184500_clear_placeholder_contacts.down,
    name: '20260813_184500_clear_placeholder_contacts'
  },
  {
    up: migration_20260814_004500_store_name_rumi_and_zuni.up,
    down: migration_20260814_004500_store_name_rumi_and_zuni.down,
    name: '20260814_004500_store_name_rumi_and_zuni'
  },
  {
    up: migration_20260814_120000_height_sizing.up,
    down: migration_20260814_120000_height_sizing.down,
    name: '20260814_120000_height_sizing'
  },
  {
    up: migration_20260814_180000_catalog_taxonomy.up,
    down: migration_20260814_180000_catalog_taxonomy.down,
    name: '20260814_180000_catalog_taxonomy'
  },
  {
    up: migration_20260814_193000_storefront_nav.up,
    down: migration_20260814_193000_storefront_nav.down,
    name: '20260814_193000_storefront_nav'
  },
  {
    up: migration_20260814_200000_womens_catalog.up,
    down: migration_20260814_200000_womens_catalog.down,
    name: '20260814_200000_womens_catalog'
  },
  {
    up: migration_20260814_220000_womens_sample_products.up,
    down: migration_20260814_220000_womens_sample_products.down,
    name: '20260814_220000_womens_sample_products'
  },
];
