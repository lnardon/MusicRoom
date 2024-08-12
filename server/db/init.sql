CREATE TABLE "Artists" (
    "id" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "albums" CHAR(36) NOT NULL,
    "avatar" TEXT NOT NULL,
    PRIMARY KEY("id")
);

CREATE TABLE "Albums" (
    "id" CHAR(36) NOT NULL,
    "title" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "release_date" TEXT NOT NULL,
    "songs" CHAR(36) NOT NULL,
    PRIMARY KEY("id")
);

CREATE TABLE "Songs" (
    "id" CHAR(36) NOT NULL,
    "title" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "track_number" INT NOT NULL,
    "release_date" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "lyrics" TEXT NOT NULL,
    PRIMARY KEY("id")
);

ALTER TABLE "Artists"
    ADD CONSTRAINT "artists_albums_fk" FOREIGN KEY("albums") REFERENCES "Albums"("id");

ALTER TABLE "Albums"
    ADD CONSTRAINT "albums_songs_fk" FOREIGN KEY("songs") REFERENCES "Songs"("id");
