CREATE TABLE `stories` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`source` text NOT NULL,
	`source_url` text NOT NULL,
	`age` text NOT NULL,
	`read_time` text NOT NULL,
	`tags` text NOT NULL,
	`image` text NOT NULL,
	`image_fallback` text NOT NULL,
	`accent` text NOT NULL,
	`coverage` integer NOT NULL,
	`category` text NOT NULL,
	`importance` integer NOT NULL,
	`created_at` integer NOT NULL
);
