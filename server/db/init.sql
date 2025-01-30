CREATE TABLE `Users`(
    `id` CHAR(36) NOT NULL,
    `username` TEXT NOT NULL,
    `password` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `Artists`(
    `id` CHAR(36) NOT NULL,
    `name` TEXT NOT NULL,
    `albums` CHAR(36) NULL,
    `avatar` TEXT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `Albums`(
    `id` CHAR(36) NOT NULL,
    `title` TEXT NOT NULL,
    `cover` TEXT NULL,
    `release_date` TEXT NULL,
    `artist` CHAR(36) NOT NULL,
    FOREIGN KEY(`artist`) REFERENCES `Artists`(`id`),
    PRIMARY KEY(`id`)
);
CREATE TABLE `Songs`(
    `id` CHAR(36) NOT NULL,
    `title` TEXT NOT NULL,
    `duration` TEXT NULL,
    `track_number` INT NULL,
    `release_date` TEXT NULL,
    `path` TEXT NOT NULL,
    `lyrics` TEXT NULL,
    `album` CHAR(36) NULL,
    FOREIGN KEY(`album`) REFERENCES `Albums`(`id`),
    PRIMARY KEY(`id`)
);
CREATE TABLE `History`(
    `id` CHAR(36) NOT NULL,
    `song` CHAR(36) NOT NULL,
    `timestamp` TIMESTAMP NOT NULL,
    FOREIGN KEY(`song`) REFERENCES `Songs`(`id`),
    PRIMARY KEY(`id`)
);
CREATE TABLE `Playlists`(
    `id` CHAR(36) NOT NULL,
    `name` TEXT NOT NULL,
    `cover` TEXT NOT NULL,
    `songs` CHAR(36) NOT NULL,
    FOREIGN KEY(`songs`) REFERENCES `Songs`(`id`),
    PRIMARY KEY(`id`)
);