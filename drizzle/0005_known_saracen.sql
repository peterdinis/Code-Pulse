CREATE TABLE `code-pulse_user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`ai_review_limit` integer,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `code-pulse_user`(`id`) ON UPDATE no action ON DELETE cascade
);
