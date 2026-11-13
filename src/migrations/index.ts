import * as migration_20261112_195157_initial from './20261112_195157_initial';
import * as migration_20261113_090410_add_manifesto from './20261113_090410_add_manifesto';

export const migrations = [
  {
    up: migration_20261112_195157_initial.up,
    down: migration_20261112_195157_initial.down,
    name: '20261112_195157_initial',
  },
  {
    up: migration_20261113_090410_add_manifesto.up,
    down: migration_20261113_090410_add_manifesto.down,
    name: '20261113_090410_add_manifesto'
  },
];
