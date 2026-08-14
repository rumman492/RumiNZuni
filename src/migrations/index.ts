import * as migration_20260813_183755_initial from './20260813_183755_initial';
import * as migration_20260813_184500_clear_placeholder_contacts from './20260813_184500_clear_placeholder_contacts';
import * as migration_20260814_004500_store_name_rumi_and_zuni from './20260814_004500_store_name_rumi_and_zuni';
import * as migration_20260814_120000_height_sizing from './20260814_120000_height_sizing';
import * as migration_20260814_180000_catalog_taxonomy from './20260814_180000_catalog_taxonomy';

import * as migration_20260814_193000_storefront_nav from './20260814_193000_storefront_nav';

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
];
