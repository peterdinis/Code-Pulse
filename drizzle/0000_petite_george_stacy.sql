CREATE TABLE "code-pulse_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "code-pulse_notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"related_id" text,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "code-pulse_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "code-pulse_pr_review" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"repository_id" text,
	"pr_number" integer NOT NULL,
	"pr_url" text,
	"pr_title" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"summary" text,
	"diff_text" text,
	"ai_review" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "code-pulse_repository" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"full_name" text NOT NULL,
	"owner" text NOT NULL,
	"name" text NOT NULL,
	"url" text,
	"github_repo_id" text,
	"default_branch" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "code-pulse_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "code-pulse_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "code-pulse_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "code-pulse_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "code-pulse_user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"ai_review_limit" integer,
	"ai_provider" text,
	"openai_api_key" text,
	"gemini_api_key" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "code-pulse_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "code-pulse_account" ADD CONSTRAINT "code-pulse_account_user_id_code-pulse_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."code-pulse_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code-pulse_notification" ADD CONSTRAINT "code-pulse_notification_user_id_code-pulse_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."code-pulse_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code-pulse_pr_review" ADD CONSTRAINT "code-pulse_pr_review_user_id_code-pulse_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."code-pulse_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code-pulse_pr_review" ADD CONSTRAINT "code-pulse_pr_review_repository_id_code-pulse_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."code-pulse_repository"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code-pulse_repository" ADD CONSTRAINT "code-pulse_repository_user_id_code-pulse_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."code-pulse_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code-pulse_session" ADD CONSTRAINT "code-pulse_session_user_id_code-pulse_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."code-pulse_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code-pulse_user_settings" ADD CONSTRAINT "code-pulse_user_settings_user_id_code-pulse_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."code-pulse_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "code-pulse_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_userId_idx" ON "code-pulse_notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_readAt_idx" ON "code-pulse_notification" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "name_idx" ON "code-pulse_post" USING btree ("name");--> statement-breakpoint
CREATE INDEX "pr_review_userId_idx" ON "code-pulse_pr_review" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pr_review_repositoryId_idx" ON "code-pulse_pr_review" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "repository_userId_idx" ON "code-pulse_repository" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "repository_fullName_idx" ON "code-pulse_repository" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "code-pulse_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "code-pulse_verification" USING btree ("identifier");