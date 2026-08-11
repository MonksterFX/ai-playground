CREATE TABLE `cart_items` (
	`id` text PRIMARY KEY NOT NULL,
	`cart_id` text NOT NULL,
	`product_id` text NOT NULL,
	`qty` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_cart_items_cart_id` ON `cart_items` (`cart_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_cart_items_cart_product` ON `cart_items` (`cart_id`,`product_id`);--> statement-breakpoint
CREATE TABLE `carts` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`cart_id` text,
	`items_json` text NOT NULL,
	`subtotal_in_cents` integer NOT NULL,
	`shipping_in_cents` integer NOT NULL,
	`total_in_cents` integer NOT NULL,
	`contact_email` text,
	`shipping_name` text,
	`shipping_city` text,
	`shipping_country` text,
	`created_at` text NOT NULL
);
