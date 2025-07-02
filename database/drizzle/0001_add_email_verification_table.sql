CREATE TABLE `user_email_verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`otp_code` text NOT NULL,
	`expires_at` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 3 NOT NULL,
	`last_sent_at` integer NOT NULL,
	`resend_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_email_verifications_user_id` ON `user_email_verifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_email_verifications_otp` ON `user_email_verifications` (`otp_code`);--> statement-breakpoint
CREATE INDEX `idx_email_verifications_expires` ON `user_email_verifications` (`expires_at`);--> statement-breakpoint
ALTER TABLE `users` ADD `email_verified_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `verification_source` text DEFAULT 'email';--> statement-breakpoint
CREATE INDEX `idx_users_email_verified` ON `users` (`email_verified_at`);