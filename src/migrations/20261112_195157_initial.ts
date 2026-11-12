import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_notes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__notes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__notes_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_travels_country" AS ENUM('AF', 'ZA', 'AX', 'AL', 'DZ', 'DE', 'AD', 'AO', 'AI', 'AQ', 'AG', 'SA', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BY', 'BO', 'BQ', 'BA', 'BW', 'BR', 'BN', 'BG', 'BF', 'BI', 'KH', 'CM', 'CA', 'CV', 'CL', 'CN', 'CY', 'CO', 'KM', 'KP', 'KR', 'CR', 'CI', 'HR', 'CU', 'CW', 'DK', 'DJ', 'DM', 'EG', 'SV', 'AE', 'EC', 'ER', 'ES', 'EE', 'US', 'ET', 'FJ', 'FI', 'FR', 'GA', 'GM', 'GE', 'GS', 'GH', 'GI', 'GR', 'GD', 'GL', 'GP', 'GU', 'GT', 'GG', 'GN', 'GQ', 'GW', 'GY', 'GF', 'HT', 'HN', 'HK', 'HU', 'BV', 'CX', 'IM', 'NF', 'KY', 'CC', 'CK', 'FO', 'HM', 'FK', 'MP', 'MH', 'UM', 'PN', 'SB', 'TC', 'VI', 'VG', 'IN', 'ID', 'IQ', 'IR', 'IE', 'IS', 'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'KG', 'KI', 'XK', 'KW', 'LA', 'LS', 'LV', 'LB', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MK', 'MG', 'MY', 'MW', 'MV', 'ML', 'MT', 'MA', 'MQ', 'MU', 'MR', 'YT', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NI', 'NE', 'NG', 'NU', 'NO', 'NC', 'NZ', 'IO', 'OM', 'UG', 'UZ', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'NL', 'PE', 'PH', 'PL', 'PF', 'PR', 'PT', 'QA', 'CF', 'CD', 'DO', 'CG', 'CZ', 'TZ', 'RE', 'RO', 'SZ', 'GB', 'RU', 'RW', 'EH', 'BL', 'KN', 'SM', 'MF', 'SX', 'PM', 'VA', 'VC', 'SH', 'LC', 'WS', 'AS', 'ST', 'SN', 'RS', 'SC', 'SL', 'SG', 'SK', 'SI', 'SO', 'SD', 'SS', 'LK', 'SE', 'CH', 'SR', 'SJ', 'SY', 'TJ', 'TW', 'TD', 'TF', 'TH', 'TL', 'TG', 'TK', 'TO', 'TT', 'TN', 'TM', 'TR', 'TV', 'UA', 'UY', 'VU', 'VE', 'VN', 'WF', 'YE', 'ZM', 'ZW');
  CREATE TYPE "public"."enum_interests_kind" AS ENUM('book', 'film', 'series', 'activity');
  CREATE TYPE "public"."enum_interests_status" AS ENUM('current', 'done', 'wishlist');
  CREATE TYPE "public"."enum_goals_status" AS ENUM('planned', 'in_progress', 'achieved', 'dropped');
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cover_id" integer,
  	"theme_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"content" jsonb,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_cover_id" integer,
  	"version_theme_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__articles_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_articles_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "themes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" numeric DEFAULT 0,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "themes_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "notes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_notes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "notes_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "notes_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_notes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__notes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__notes_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_notes_v_locales" (
  	"version_title" varchar,
  	"version_content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_notes_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "travels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"country" "enum_travels_country" NOT NULL,
  	"year" numeric NOT NULL,
  	"latitude" numeric,
  	"longitude" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "travels_locales" (
  	"city" varchar NOT NULL,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "interests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_interests_kind" NOT NULL,
  	"status" "enum_interests_status" DEFAULT 'current' NOT NULL,
  	"creator" varchar,
  	"release_year" numeric,
  	"rating" numeric,
  	"date" timestamp(3) with time zone,
  	"cover_id" integer,
  	"link" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "interests_locales" (
  	"title" varchar NOT NULL,
  	"comment" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "goals" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric NOT NULL,
  	"domain_id" integer NOT NULL,
  	"status" "enum_goals_status" DEFAULT 'planned' NOT NULL,
  	"current" numeric,
  	"target" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "goals_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "goal_domains" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "goal_domains_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"themes_id" integer,
  	"notes_id" integer,
  	"travels_id" integer,
  	"interests_id" integer,
  	"goals_id" integer,
  	"goal_domains_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "about_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"period" varchar NOT NULL
  );
  
  CREATE TABLE "about_timeline_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_locales" (
  	"headline" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "settings_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Mohamed Diallo',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "settings_locales" (
  	"kicker" varchar,
  	"tagline" varchar,
  	"intro" varchar,
  	"footer_message" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_locales" ADD CONSTRAINT "articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_theme_id_themes_id_fk" FOREIGN KEY ("version_theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_locales" ADD CONSTRAINT "_articles_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "themes_locales" ADD CONSTRAINT "themes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_locales" ADD CONSTRAINT "notes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_texts" ADD CONSTRAINT "notes_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v" ADD CONSTRAINT "_notes_v_parent_id_notes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notes_v_locales" ADD CONSTRAINT "_notes_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_notes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v_texts" ADD CONSTRAINT "_notes_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_notes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "travels_locales" ADD CONSTRAINT "travels_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."travels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "interests" ADD CONSTRAINT "interests_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "interests_locales" ADD CONSTRAINT "interests_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."interests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "goals" ADD CONSTRAINT "goals_domain_id_goal_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."goal_domains"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "goals_locales" ADD CONSTRAINT "goals_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "goal_domains_locales" ADD CONSTRAINT "goal_domains_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."goal_domains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_themes_fk" FOREIGN KEY ("themes_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_travels_fk" FOREIGN KEY ("travels_id") REFERENCES "public"."travels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_interests_fk" FOREIGN KEY ("interests_id") REFERENCES "public"."interests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_goals_fk" FOREIGN KEY ("goals_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_goal_domains_fk" FOREIGN KEY ("goal_domains_id") REFERENCES "public"."goal_domains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_timeline" ADD CONSTRAINT "about_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_timeline_locales" ADD CONSTRAINT "about_timeline_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about" ADD CONSTRAINT "about_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_locales" ADD CONSTRAINT "about_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_socials" ADD CONSTRAINT "settings_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_locales" ADD CONSTRAINT "settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_cover_idx" ON "articles" USING btree ("cover_id");
  CREATE INDEX "articles_theme_idx" ON "articles" USING btree ("theme_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "articles_slug_idx" ON "articles_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "articles_locales_locale_parent_id_unique" ON "articles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_locales_parent_id_idx" ON "articles_locales" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_cover_idx" ON "_articles_v" USING btree ("version_cover_id");
  CREATE INDEX "_articles_v_version_version_theme_idx" ON "_articles_v" USING btree ("version_theme_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_snapshot_idx" ON "_articles_v" USING btree ("snapshot");
  CREATE INDEX "_articles_v_published_locale_idx" ON "_articles_v" USING btree ("published_locale");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_autosave_idx" ON "_articles_v" USING btree ("autosave");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_articles_v_locales_locale_parent_id_unique" ON "_articles_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_locales_parent_id_idx" ON "_articles_v_locales" USING btree ("_parent_id");
  CREATE INDEX "themes_slug_idx" ON "themes" USING btree ("slug");
  CREATE INDEX "themes_updated_at_idx" ON "themes" USING btree ("updated_at");
  CREATE INDEX "themes_created_at_idx" ON "themes" USING btree ("created_at");
  CREATE UNIQUE INDEX "themes_locales_locale_parent_id_unique" ON "themes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "themes_locales_parent_id_idx" ON "themes_locales" USING btree ("_parent_id");
  CREATE INDEX "notes_updated_at_idx" ON "notes" USING btree ("updated_at");
  CREATE INDEX "notes_created_at_idx" ON "notes" USING btree ("created_at");
  CREATE INDEX "notes__status_idx" ON "notes" USING btree ("_status");
  CREATE UNIQUE INDEX "notes_locales_locale_parent_id_unique" ON "notes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "notes_locales_parent_id_idx" ON "notes_locales" USING btree ("_parent_id");
  CREATE INDEX "notes_texts_order_parent" ON "notes_texts" USING btree ("order","parent_id");
  CREATE INDEX "_notes_v_parent_idx" ON "_notes_v" USING btree ("parent_id");
  CREATE INDEX "_notes_v_version_version_updated_at_idx" ON "_notes_v" USING btree ("version_updated_at");
  CREATE INDEX "_notes_v_version_version_created_at_idx" ON "_notes_v" USING btree ("version_created_at");
  CREATE INDEX "_notes_v_version_version__status_idx" ON "_notes_v" USING btree ("version__status");
  CREATE INDEX "_notes_v_created_at_idx" ON "_notes_v" USING btree ("created_at");
  CREATE INDEX "_notes_v_updated_at_idx" ON "_notes_v" USING btree ("updated_at");
  CREATE INDEX "_notes_v_snapshot_idx" ON "_notes_v" USING btree ("snapshot");
  CREATE INDEX "_notes_v_published_locale_idx" ON "_notes_v" USING btree ("published_locale");
  CREATE INDEX "_notes_v_latest_idx" ON "_notes_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_notes_v_locales_locale_parent_id_unique" ON "_notes_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_notes_v_locales_parent_id_idx" ON "_notes_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_notes_v_texts_order_parent" ON "_notes_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "travels_updated_at_idx" ON "travels" USING btree ("updated_at");
  CREATE INDEX "travels_created_at_idx" ON "travels" USING btree ("created_at");
  CREATE UNIQUE INDEX "travels_locales_locale_parent_id_unique" ON "travels_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "travels_locales_parent_id_idx" ON "travels_locales" USING btree ("_parent_id");
  CREATE INDEX "interests_cover_idx" ON "interests" USING btree ("cover_id");
  CREATE INDEX "interests_updated_at_idx" ON "interests" USING btree ("updated_at");
  CREATE INDEX "interests_created_at_idx" ON "interests" USING btree ("created_at");
  CREATE UNIQUE INDEX "interests_locales_locale_parent_id_unique" ON "interests_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "interests_locales_parent_id_idx" ON "interests_locales" USING btree ("_parent_id");
  CREATE INDEX "goals_domain_idx" ON "goals" USING btree ("domain_id");
  CREATE INDEX "goals_updated_at_idx" ON "goals" USING btree ("updated_at");
  CREATE INDEX "goals_created_at_idx" ON "goals" USING btree ("created_at");
  CREATE UNIQUE INDEX "goals_locales_locale_parent_id_unique" ON "goals_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "goals_locales_parent_id_idx" ON "goals_locales" USING btree ("_parent_id");
  CREATE INDEX "goal_domains_updated_at_idx" ON "goal_domains" USING btree ("updated_at");
  CREATE INDEX "goal_domains_created_at_idx" ON "goal_domains" USING btree ("created_at");
  CREATE UNIQUE INDEX "goal_domains_locales_locale_parent_id_unique" ON "goal_domains_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "goal_domains_locales_parent_id_idx" ON "goal_domains_locales" USING btree ("_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_themes_id_idx" ON "payload_locked_documents_rels" USING btree ("themes_id");
  CREATE INDEX "payload_locked_documents_rels_notes_id_idx" ON "payload_locked_documents_rels" USING btree ("notes_id");
  CREATE INDEX "payload_locked_documents_rels_travels_id_idx" ON "payload_locked_documents_rels" USING btree ("travels_id");
  CREATE INDEX "payload_locked_documents_rels_interests_id_idx" ON "payload_locked_documents_rels" USING btree ("interests_id");
  CREATE INDEX "payload_locked_documents_rels_goals_id_idx" ON "payload_locked_documents_rels" USING btree ("goals_id");
  CREATE INDEX "payload_locked_documents_rels_goal_domains_id_idx" ON "payload_locked_documents_rels" USING btree ("goal_domains_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "about_timeline_order_idx" ON "about_timeline" USING btree ("_order");
  CREATE INDEX "about_timeline_parent_id_idx" ON "about_timeline" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_timeline_locales_locale_parent_id_unique" ON "about_timeline_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_timeline_locales_parent_id_idx" ON "about_timeline_locales" USING btree ("_parent_id");
  CREATE INDEX "about_photo_idx" ON "about" USING btree ("photo_id");
  CREATE UNIQUE INDEX "about_locales_locale_parent_id_unique" ON "about_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_locales_parent_id_idx" ON "about_locales" USING btree ("_parent_id");
  CREATE INDEX "settings_socials_order_idx" ON "settings_socials" USING btree ("_order");
  CREATE INDEX "settings_socials_parent_id_idx" ON "settings_socials" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "settings_locales_locale_parent_id_unique" ON "settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "settings_locales_parent_id_idx" ON "settings_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_locales" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_locales" CASCADE;
  DROP TABLE "themes" CASCADE;
  DROP TABLE "themes_locales" CASCADE;
  DROP TABLE "notes" CASCADE;
  DROP TABLE "notes_locales" CASCADE;
  DROP TABLE "notes_texts" CASCADE;
  DROP TABLE "_notes_v" CASCADE;
  DROP TABLE "_notes_v_locales" CASCADE;
  DROP TABLE "_notes_v_texts" CASCADE;
  DROP TABLE "travels" CASCADE;
  DROP TABLE "travels_locales" CASCADE;
  DROP TABLE "interests" CASCADE;
  DROP TABLE "interests_locales" CASCADE;
  DROP TABLE "goals" CASCADE;
  DROP TABLE "goals_locales" CASCADE;
  DROP TABLE "goal_domains" CASCADE;
  DROP TABLE "goal_domains_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "about_timeline" CASCADE;
  DROP TABLE "about_timeline_locales" CASCADE;
  DROP TABLE "about" CASCADE;
  DROP TABLE "about_locales" CASCADE;
  DROP TABLE "settings_socials" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TABLE "settings_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum__articles_v_published_locale";
  DROP TYPE "public"."enum_notes_status";
  DROP TYPE "public"."enum__notes_v_version_status";
  DROP TYPE "public"."enum__notes_v_published_locale";
  DROP TYPE "public"."enum_travels_country";
  DROP TYPE "public"."enum_interests_kind";
  DROP TYPE "public"."enum_interests_status";
  DROP TYPE "public"."enum_goals_status";`)
}
