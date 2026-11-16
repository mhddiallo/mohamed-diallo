import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_themes_icon" AS ENUM('sparkles', 'landmark', 'fingerprint', 'network', 'wallet', 'code', 'briefcase', 'trending-up', 'target', 'heart-pulse', 'plane', 'globe', 'book-open', 'lightbulb', 'compass', 'layers');
  ALTER TABLE "themes" ADD COLUMN "icon" "enum_themes_icon" DEFAULT 'layers';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "themes" DROP COLUMN "icon";
  DROP TYPE "public"."enum_themes_icon";`)
}
