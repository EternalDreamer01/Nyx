CREATE TABLE `ids`(
	`id` INTEGER,
	`first_name` VARCHAR(80),
	`middle_name` VARCHAR(80),
	`last_name` VARCHAR(80),
	`full_name` VARCHAR(120),
	`language` VARCHAR(10),
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`, `first_name`, `middle_name`, `last_name`, `full_name`)
);

-- Email or phone number
CREATE TABLE `service`(
	`id` INTEGER,
	`value` VARCHAR(256),
	`origin` VARCHAR(40),
	`type` TINYINT(2),
	`pseudo` VARCHAR(40),
	`about` VARCHAR(10000),
	`language` VARCHAR(10),
	`verified` TINYINT(1) DEFAULT 0,
	`restriction` VARCHAR(200),
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`, `value`)
	FOREIGN KEY(`id`) REFERENCES `user`(`id`)
);
