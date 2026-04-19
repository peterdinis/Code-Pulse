// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

/**
 * Table name prefix for multi-project schema (code-pulse_*).
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
const prefix = (name: string) => `code-pulse_${name}`;

export const posts = pgTable(
	prefix("post"),
	{
		id: serial("id").primaryKey(),
		name: text("name"),
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(
			() => new Date(),
		),
	},
	(t) => [index("name_idx").on(t.name)],
);

export const user = pgTable(prefix("user"), {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "date" })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const session = pgTable(
	prefix("session"),
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
	prefix("account"),
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at", {
			mode: "date",
		}),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
			mode: "date",
		}),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	prefix("verification"),
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const repository = pgTable(
	prefix("repository"),
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		fullName: text("full_name").notNull(),
		owner: text("owner").notNull(),
		name: text("name").notNull(),
		url: text("url"),
		githubRepoId: text("github_repo_id"),
		defaultBranch: text("default_branch"),
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("repository_userId_idx").on(table.userId),
		index("repository_fullName_idx").on(table.fullName),
	],
);

export const prReview = pgTable(
	prefix("pr_review"),
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		repositoryId: text("repository_id").references(() => repository.id, {
			onDelete: "set null",
		}),
		prNumber: integer("pr_number").notNull(),
		prUrl: text("pr_url"),
		prTitle: text("pr_title"),
		status: text("status", {
			enum: ["pending", "in_progress", "completed", "failed"],
		})
			.default("pending")
			.notNull(),
		summary: text("summary"),
		diffText: text("diff_text"),
		aiReview: text("ai_review"),
		/** GitHub issue comment id when AI summary was posted to the PR conversation */
		githubCommentId: text("github_comment_id"),
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("pr_review_userId_idx").on(table.userId),
		index("pr_review_repositoryId_idx").on(table.repositoryId),
	],
);

export const userSettings = pgTable(prefix("user_settings"), {
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	aiReviewLimit: integer("ai_review_limit"),
	/** AI provider for code reviews: "openai" (ChatGPT) or "gemini" */
	aiProvider: text("ai_provider", { enum: ["openai", "gemini"] }),
	/** User's OpenAI API key (optional; falls back to OPENAI_API_KEY env if not set) */
	openaiApiKey: text("openai_api_key"),
	/** User's Google Gemini API key */
	geminiApiKey: text("gemini_api_key"),
	/** When true, post (or update) AI review text as a comment on the GitHub PR after each run */
	postAiReviewToGitHub: boolean("post_ai_review_to_github")
		.default(false)
		.notNull(),
	updatedAt: timestamp("updated_at", { mode: "date" })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const notification = pgTable(
	prefix("notification"),
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: text("type").notNull(),
		title: text("title").notNull(),
		body: text("body"),
		relatedId: text("related_id"),
		readAt: timestamp("read_at", { mode: "date" }),
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
	},
	(table) => [
		index("notification_userId_idx").on(table.userId),
		index("notification_readAt_idx").on(table.readAt),
	],
);

export const userRelations = relations(user, ({ one, many }) => ({
	sessions: many(session),
	accounts: many(account),
	repositories: many(repository),
	prReviews: many(prReview),
	notifications: many(notification),
	settings: one(userSettings),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
	user: one(user, {
		fields: [userSettings.userId],
		references: [user.id],
	}),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const repositoryRelations = relations(repository, ({ one, many }) => ({
	user: one(user, {
		fields: [repository.userId],
		references: [user.id],
	}),
	prReviews: many(prReview),
}));

export const prReviewRelations = relations(prReview, ({ one }) => ({
	user: one(user, {
		fields: [prReview.userId],
		references: [user.id],
	}),
	repository: one(repository, {
		fields: [prReview.repositoryId],
		references: [repository.id],
	}),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
	user: one(user, {
		fields: [notification.userId],
		references: [user.id],
	}),
}));
