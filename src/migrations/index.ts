import * as migration_20261112_195157_initial from './20261112_195157_initial';
import * as migration_20261113_090410_add_manifesto from './20261113_090410_add_manifesto';
import * as migration_20261113_201831_add_ticker from './20261113_201831_add_ticker';
import * as migration_20261113_215034_optional_travel_year from './20261113_215034_optional_travel_year';
import * as migration_20261113_224729_about_timeline_category from './20261113_224729_about_timeline_category';

export const migrations = [
  {
    up: migration_20261112_195157_initial.up,
    down: migration_20261112_195157_initial.down,
    name: '20261112_195157_initial',
  },
  {
    up: migration_20261113_090410_add_manifesto.up,
    down: migration_20261113_090410_add_manifesto.down,
    name: '20261113_090410_add_manifesto',
  },
  {
    up: migration_20261113_201831_add_ticker.up,
    down: migration_20261113_201831_add_ticker.down,
    name: '20261113_201831_add_ticker',
  },
  {
    up: migration_20261113_215034_optional_travel_year.up,
    down: migration_20261113_215034_optional_travel_year.down,
    name: '20261113_215034_optional_travel_year',
  },
  {
    up: migration_20261113_224729_about_timeline_category.up,
    down: migration_20261113_224729_about_timeline_category.down,
    name: '20261113_224729_about_timeline_category'
  },
];
