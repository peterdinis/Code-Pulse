CREATE TABLE `code-pulse_notification` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`related_id` text,
	`read_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `code-pulse_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notification_userId_idx` ON `code-pulse_notification` (`user_id`);--> statement-breakpoint
CREATE INDEX `notification_readAt_idx` ON `code-pulse_notification` (`read_at`);--> statement-breakpoint
ALTER TABLE `code-pulse_pr_review` ADD `diff_text` text;--> statement-breakpoint
ALTER TABLE `code-pulse_pr_review` ADD `ai_review` text;