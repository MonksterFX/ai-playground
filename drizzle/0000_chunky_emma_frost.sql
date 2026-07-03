CREATE TABLE `admin_actions` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` text NOT NULL,
	`action_type` text NOT NULL,
	`target_page_id` text,
	`metadata_json` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` text NOT NULL,
	`event_type` text NOT NULL,
	`page_id` text,
	`url` text,
	`path` text,
	`method` text,
	`status_code` integer,
	`response_time_ms` integer,
	`user_agent` text,
	`referrer` text,
	`ip_address` text,
	`request_id` text,
	`session_id` text,
	`agent_hint` text,
	`headers_json` text,
	`metadata_json` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_events_timestamp` ON `events` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_events_page_id` ON `events` (`page_id`);--> statement-breakpoint
CREATE INDEX `idx_events_event_type` ON `events` (`event_type`);--> statement-breakpoint
CREATE INDEX `idx_events_request_id` ON `events` (`request_id`);--> statement-breakpoint
CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`path` text NOT NULL,
	`description` text,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pages_path_unique` ON `pages` (`path`);