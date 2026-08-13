import * as migration_20260813_183755_initial from './20260813_183755_initial';

export const migrations = [
  {
    up: migration_20260813_183755_initial.up,
    down: migration_20260813_183755_initial.down,
    name: '20260813_183755_initial'
  },
];
