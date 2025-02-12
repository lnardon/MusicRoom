CREATE TABLE Users (
    id UUID PRIMARY KEY NOT NULL,
    username VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Artists (
    id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    albums UUID NULL,
    avatar TEXT NULL
);

CREATE TABLE Albums (
    id UUID PRIMARY KEY NOT NULL,
    title VARCHAR(255) NOT NULL,
    cover TEXT NULL,
    release_date DATE NULL,
    artist UUID NOT NULL,
    CONSTRAINT fk_artist FOREIGN KEY (artist) REFERENCES Artists(id) ON DELETE CASCADE
);

CREATE TABLE Songs (
    id UUID PRIMARY KEY NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration INTERVAL NULL,
    track_number INT NULL,
    release_date DATE NULL,
    path TEXT NOT NULL,
    lyrics TEXT NULL,
    album UUID NULL,
    CONSTRAINT fk_album FOREIGN KEY (album) REFERENCES Albums(id) ON DELETE SET NULL
);

CREATE TABLE History (
    id UUID PRIMARY KEY NOT NULL,
    song UUID NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_song FOREIGN KEY (song) REFERENCES Songs(id) ON DELETE CASCADE
);

CREATE TABLE Playlists (
    id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    cover TEXT NOT NULL
);

CREATE TABLE PlaylistSongs (
    playlist_id UUID NOT NULL,
    song_id UUID NOT NULL,
    PRIMARY KEY (playlist_id, song_id),
    CONSTRAINT fk_playlist FOREIGN KEY (playlist_id) REFERENCES Playlists(id) ON DELETE CASCADE,
    CONSTRAINT fk_song FOREIGN KEY (song_id) REFERENCES Songs(id) ON DELETE CASCADE
);
