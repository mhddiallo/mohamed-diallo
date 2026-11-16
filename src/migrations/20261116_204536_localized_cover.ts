import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles" DROP CONSTRAINT "articles_cover_id_media_id_fk";
  
  ALTER TABLE "_articles_v" DROP CONSTRAINT "_articles_v_version_cover_id_media_id_fk";
  
  DROP INDEX "articles_cover_idx";
  DROP INDEX "_articles_v_version_version_cover_idx";
  ALTER TABLE "articles_locales" ADD COLUMN "cover_id" integer;
  ALTER TABLE "_articles_v_locales" ADD COLUMN "version_cover_id" integer;
  ALTER TABLE "articles_locales" ADD CONSTRAINT "articles_locales_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_locales" ADD CONSTRAINT "_articles_v_locales_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "articles_cover_idx" ON "articles_locales" USING btree ("cover_id","_locale");
  CREATE INDEX "_articles_v_version_version_cover_idx" ON "_articles_v_locales" USING btree ("version_cover_id","_locale");
  -- Keep existing covers: copy them to every locale before dropping the old column
  UPDATE "articles_locales" l SET "cover_id" = a."cover_id" FROM "articles" a WHERE l."_parent_id" = a."id";
  UPDATE "_articles_v_locales" l SET "version_cover_id" = v."version_cover_id" FROM "_articles_v" v WHERE l."_parent_id" = v."id";
  ALTER TABLE "articles" DROP COLUMN "cover_id";
  ALTER TABLE "_articles_v" DROP COLUMN "version_cover_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles_locales" DROP CONSTRAINT "articles_locales_cover_id_media_id_fk";
  
  ALTER TABLE "_articles_v_locales" DROP CONSTRAINT "_articles_v_locales_version_cover_id_media_id_fk";
  
  DROP INDEX "articles_cover_idx";
  DROP INDEX "_articles_v_version_version_cover_idx";
  ALTER TABLE "articles" ADD COLUMN "cover_id" integer;
  ALTER TABLE "_articles_v" ADD COLUMN "version_cover_id" integer;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "articles_cover_idx" ON "articles" USING btree ("cover_id");
  CREATE INDEX "_articles_v_version_version_cover_idx" ON "_articles_v" USING btree ("version_cover_id");
  ALTER TABLE "articles_locales" DROP COLUMN "cover_id";
  ALTER TABLE "_articles_v_locales" DROP COLUMN "version_cover_id";`)
}
