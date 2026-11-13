import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "settings_ticker" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "settings_ticker_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "settings_ticker" ADD CONSTRAINT "settings_ticker_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_ticker_locales" ADD CONSTRAINT "settings_ticker_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings_ticker"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "settings_ticker_order_idx" ON "settings_ticker" USING btree ("_order");
  CREATE INDEX "settings_ticker_parent_id_idx" ON "settings_ticker" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "settings_ticker_locales_locale_parent_id_unique" ON "settings_ticker_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "settings_ticker_locales_parent_id_idx" ON "settings_ticker_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "settings_ticker" CASCADE;
  DROP TABLE "settings_ticker_locales" CASCADE;`)
}
