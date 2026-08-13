import * as migration_20260813_183755_initial from './20260813_183755_initial';
import * as migration_20260813_184500_clear_placeholder_contacts from './20260813_184500_clear_placeholder_contacts';

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
];
