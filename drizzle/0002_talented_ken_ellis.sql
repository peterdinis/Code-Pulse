CREATE TABLE `code-pulse_pr_review` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`repository_id` text,
	`pr_number` integer NOT NULL,
	`pr_url` text,
	`pr_title` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`summary` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `code-pulse_user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`repository_id`) REFERENCES `code-pulse_repository`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `pr_review_userId_idx` ON `code-pulse_pr_review` (`user_id`);--> statement-breakpoint
CREATE INDEX `pr_review_repositoryId_idx` ON `code-pulse_pr_review` (`repository_id`);--> statement-breakpoint
CREATE TABLE `code-pulse_repository` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`full_name` text NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`github_repo_id` text,
	`default_branch` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `code-pulse_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `repository_userId_idx` ON `code-pulse_repository` (`user_id`);--> statement-breakpoint
CREATE INDEX `repository_fullName_idx` ON `code-pulse_repository` (`full_name`);