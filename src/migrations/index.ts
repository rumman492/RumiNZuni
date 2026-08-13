import * as migration_20260813_183755_initial from './20260813_183755_initial';
import * as migration_20260813_184500_clear_placeholder_contacts from './20260813_184500_clear_placeholder_contacts';
import * as migration_20260814_004500_store_name_rumi_and_zuni from './20260814_004500_store_name_rumi_and_zuni';

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
];
