import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_about_timeline_category" AS ENUM('experience', 'education', 'certification', 'award');
  ALTER TABLE "about_timeline" ADD COLUMN "category" "enum_about_timeline_category" DEFAULT 'experience' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "about_timeline" DROP COLUMN "category";
  DROP TYPE "public"."enum_about_timeline_category";`)
}
