package album

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	Types "server/types"

	"github.com/bogem/id3v2"
)

func GetAllAlbumsHandler(w http.ResponseWriter, r *http.Request){
    db, err := sql.Open("sqlite3", "./db/database.db")
	if err != nil {
		http.Error(w, "Failed to open database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

    rows, err := db.Query("SELECT * FROM Albums")
    if err != nil {
        http.Error(w, "Failed to query database", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var albums []string
    for rows.Next() {
        var id, title, cover, releaseDate, songs string
        if err := rows.Scan(&id, &title, &cover, &releaseDate, &songs); err != nil {
            http.Error(w, "Failed to scan row", http.StatusInternalServerError)
            return
        }
        albums = append(albums, title)
    }

    jsonResponse, err := json.Marshal(albums)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write(jsonResponse)
}

func GetAlbumHandler(w http.ResponseWriter, r *http.Request){
    album := r.URL.Query().Get("album")

    db, err := sql.Open("sqlite3", "./db/database.db")
    if err != nil {
        http.Error(w, "Failed to open database", http.StatusInternalServerError)
        return
    }

    var albumArtist string
    err = db.QueryRow("SELECT name FROM Artists WHERE id = (SELECT artist FROM Albums WHERE id = ?)", album).Scan(&albumArtist)
    if err != nil {
        http.Error(w, "Failed to query artist", http.StatusInternalServerError)
        return
    }

    var albumTitle string
    err = db.QueryRow("SELECT title FROM Albums WHERE id = ?", album).Scan(&albumTitle)
    if err != nil {
        http.Error(w, "Failed to query album", http.StatusInternalServerError)
        return
    }

    songsRows, err := db.Query("SELECT id, title, duration, track_number, path FROM Songs WHERE album = ?", album)
    if err != nil {
        http.Error(w, "Failed to query songs", http.StatusInternalServerError)
        return
    }
    defer songsRows.Close()

    var albumInfo Types.Album
    albumInfo.Title = albumTitle
    albumInfo.ID = album
    albumInfo.Cover = "/album_covers/cover_" + album + ".jpg"
    albumInfo.Artist = albumArtist
    
    for songsRows.Next() {
        var song Types.Song
        if err := songsRows.Scan(&song.ID, &song.Title, &song.Duration, &song.TrackNumber, &song.Path); err != nil {
            http.Error(w, "Error scanning songs", http.StatusInternalServerError)
            return
        }
        albumInfo.Songs = append(albumInfo.Songs, song)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(albumInfo)
}

func GetCoverHandler(w http.ResponseWriter, r *http.Request) {
    file := r.URL.Query().Get("file")

    db, err := sql.Open("sqlite3", "./db/database.db")
	if err != nil {
		http.Error(w, "Failed to open database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

    var albumName string
    err = db.QueryRow("SELECT title FROM Albums WHERE id = ?", file).Scan(&albumName)
    if err != nil {
        http.Error(w, "Error fetching album from database: "+err.Error(), http.StatusInternalServerError)
        return
    }

    coverPath := fmt.Sprintf("./album_covers/cover_%s.jpg", albumName)

    if _, err := os.Stat(coverPath); os.IsNotExist(err) {
        findAndServeAlbumCoverFromDB(w, albumName)
    } else {
        http.ServeFile(w, r, coverPath)
    }
}

func findAndServeAlbumCoverFromDB(w http.ResponseWriter, albumName string) {
    db, err := sql.Open("sqlite3", "./db/database.db")
    if err != nil {
        http.Error(w, "Error connecting to database: "+err.Error(), http.StatusInternalServerError)
        return
    }
    defer db.Close()

    var songPath string
    query := `SELECT s.path FROM Songs s 
              JOIN Albums a ON s.album = a.id 
              WHERE a.title = ? LIMIT 1`
    err = db.QueryRow(query, albumName).Scan(&songPath)
    if err != nil {
        http.Error(w, "Error fetching song from database: "+err.Error(), http.StatusInternalServerError)
        return
    }

    tag, err := id3v2.Open(songPath, id3v2.Options{Parse: true})
    if err != nil {
        http.Error(w, "Error opening MP3 file: "+err.Error(), http.StatusInternalServerError)
        return
    }
    defer tag.Close()

    frames := tag.GetFrames(tag.CommonID("Attached picture"))
    for _, f := range frames {
        pic, ok := f.(id3v2.PictureFrame)
        if ok {
            w.Header().Set("Content-Type", "image/jpeg")
            w.Write(pic.Picture)
            return
        }
    }

    http.Error(w, "No cover found in ID3 metadata", http.StatusNotFound)
}
