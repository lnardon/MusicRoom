package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	Types "server/types"
	Utils "server/utils"

	"github.com/bogem/id3v2"
	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
)

func main(){
    http.Handle("/", http.FileServer(http.Dir("../frontend/dist")))

    http.HandleFunc("/test", TestHandler)

    http.HandleFunc("/getAllFiles", GetAllFilesHandler)
    http.HandleFunc("/getAllArtists", GetAllArtistsHandler)
    http.HandleFunc("/getAllAlbums", GetAllAlbumsHandler)

    http.HandleFunc("/getArtist", GetArtistHandler)
    http.HandleFunc("/getAlbum", GetAlbumHandler)
    http.HandleFunc("/getSong", GetSongHandler)
    http.HandleFunc("/getCover", GetCoverHandler)

    http.HandleFunc("/getHistory", GetHistoryHandler)


    PORT := ":7777"
    fmt.Printf("\nServer starting on port %s\n", PORT)
    fmt.Println("***")
    fmt.Println("**")

    http.ListenAndServe(PORT, nil)
}

func TestHandler(w http.ResponseWriter, r *http.Request){
    Utils.PopulateDb("/media/lucas/HDD1/Music/")
}

func GetAllFilesHandler(w http.ResponseWriter, r *http.Request){
    files, err := Utils.GetAllFilesInPath("/media/lucas/HDD1/Music/")
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    fileList := Types.FileList{Files: files}
    jsonResponse, err := json.Marshal(fileList)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write(jsonResponse)
}

func GetAllArtistsHandler(w http.ResponseWriter, r *http.Request) {
    db, err := sql.Open("sqlite3", "./db/database.db")
    if err != nil {
        http.Error(w, "Failed to open database", http.StatusInternalServerError)
        return
    }
    defer db.Close()

    rows, err := db.Query("SELECT id, name FROM Artists")
    if err != nil {
        http.Error(w, "Failed to query database", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var artists []string
    for rows.Next() {
        var id, name string
        if err := rows.Scan(&id, &name); err != nil {
            http.Error(w, "Failed to scan row", http.StatusInternalServerError)
            log.Printf("Error scanning row: %v", err)
            continue
        }
        artists = append(artists, name)
    }

    jsonResponse, err := json.Marshal(artists)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write(jsonResponse)
}


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

func GetSongHandler(w http.ResponseWriter, r *http.Request){
    file := r.URL.Query().Get("file")
    
    db, err := sql.Open("sqlite3", "./db/database.db")
	if err != nil {
		http.Error(w, "Failed to open database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

    var song Types.Song
    err = db.QueryRow("SELECT id, title, album, duration, track_number, path FROM Songs WHERE id = ?", file).Scan(&song.ID, &song.Title, &song.Album, &song.Duration, &song.TrackNumber, &song.Path)
    if err != nil {
        http.Error(w, "Song not found", http.StatusNotFound)
        log.Printf("Error fetching song: %v", err)
        return
    }

    historyId := uuid.New().String()
    _, err = db.Exec("INSERT INTO History (id, song, timestamp) VALUES (?, ?, datetime('now'))", historyId, song.ID)
    if err != nil {
        log.Printf("Error inserting into History table: %v", err)
    }

    w.Header().Set("Content-Type", "audio/mpeg")
    http.ServeFile(w, r, song.Path)
}

func GetCoverHandler(w http.ResponseWriter, r *http.Request) {
    file := r.URL.Query().Get("file")
    coverPath := fmt.Sprintf("./album_covers/cover_%s.jpg", file)

    if _, err := os.Stat(coverPath); os.IsNotExist(err) {
        findAndServeAlbumCoverFromDB(w, file)
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

func GetCover(path string) string{
	files, err := Utils.GetAllFilesInPath(path)
	if err != nil {
		log.Fatalf("Error fetching files: %v", err)
	}

	for _, file := range files {
		tag, err := id3v2.Open(file, id3v2.Options{Parse: true})
		if err != nil {
			log.Printf("Error opening file %s: %v", file, err)
			continue
		}

		frames := tag.GetFrames(tag.CommonID("Attached picture"))
		for _, f := range frames {
			pic, ok := f.(id3v2.PictureFrame)
			if ok {
				filename := fmt.Sprintf("./album_covers/cover_%s.jpg", tag.Album())
				if err := os.WriteFile(filename, pic.Picture, 0644); err != nil {
					log.Printf("Error saving file %s: %v", filename, err)
					continue
				}
                return fmt.Sprintf("/album_covers/%s", filename)
			}
		}
	}
    return ""
}

func GetAlbumHandler(w http.ResponseWriter, r *http.Request){
    album := r.URL.Query().Get("album")

    db, err := sql.Open("sqlite3", "./db/database.db")
    if err != nil {
        http.Error(w, "Failed to open database", http.StatusInternalServerError)
        return
    }

    var albumID string
    err = db.QueryRow("SELECT id FROM Albums WHERE title = ?", album).Scan(&albumID)
    if err != nil {
        http.Error(w, "Album not found", http.StatusNotFound)
        return
    }

    var albumArtist string
    err = db.QueryRow("SELECT name FROM Artists WHERE id = (SELECT artist FROM Albums WHERE title = ?)", album).Scan(&albumArtist)
    if err != nil {
        http.Error(w, "Failed to query artist", http.StatusInternalServerError)
        return
    }

    songsRows, err := db.Query("SELECT id, title, duration, track_number, path FROM Songs WHERE album = ?", albumID)
    if err != nil {
        http.Error(w, "Failed to query songs", http.StatusInternalServerError)
        return
    }
    defer songsRows.Close()

    var albumInfo Types.Album
    albumInfo.Title = album
    albumInfo.ID = albumID
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

func GetArtistHandler(w http.ResponseWriter, r *http.Request) {
	artist := r.URL.Query().Get("artist")

	db, err := sql.Open("sqlite3", "./db/database.db")
	if err != nil {
		http.Error(w, "Failed to open database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	var artistID string
	err = db.QueryRow("SELECT id FROM Artists WHERE name = ?", artist).Scan(&artistID)
	if err != nil {
		http.Error(w, "Artist not found", http.StatusNotFound)
		return
	}

	var artistInfo Types.ArtistInfo
	artistInfo.Name = artist
	albumsRows, err := db.Query("SELECT id, title FROM Albums WHERE artist = ?", artistID)
	if err != nil {
		http.Error(w, "Failed to query albums", http.StatusInternalServerError)
		return
	}
	defer albumsRows.Close()

	var albumIDs []string
	for albumsRows.Next() {
		var id, title string
		if err := albumsRows.Scan(&id, &title); err != nil {
			http.Error(w, "Error scanning albums", http.StatusInternalServerError)
			return
		}
		artistInfo.Albums = append(artistInfo.Albums, Types.Album{ID: id, Title: title})
		albumIDs = append(albumIDs, id)
	}

	for _, albumID := range albumIDs {
		songsRows, err := db.Query("SELECT id, title, duration, track_number FROM Songs WHERE album = ?", albumID)
		if err != nil {
			http.Error(w, "Failed to query songs", http.StatusInternalServerError)
			return
		}
		defer songsRows.Close()

		for songsRows.Next() {
			var song Types.Song
			if err := songsRows.Scan(&song.ID, &song.Title, &song.Duration, &song.TrackNumber); err != nil {
				http.Error(w, "Error scanning songs", http.StatusInternalServerError)
				return
			}
			artistInfo.Songs = append(artistInfo.Songs, song)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artistInfo)
}

func GetHistoryHandler(w http.ResponseWriter, r *http.Request) {
    db, err := sql.Open("sqlite3", "./db/database.db")
    if err != nil {
        http.Error(w, "Failed to open database", http.StatusInternalServerError)
        return
    }
    defer db.Close()

    rows, err := db.Query("SELECT s.id, s.title, a.name, al.title, s.path, s.duration, s.track_number FROM History h JOIN Songs s ON h.song = s.id JOIN Albums al ON s.album = al.id JOIN Artists a ON al.artist = a.id ORDER BY h.timestamp DESC")
    if err != nil {
        http.Error(w, "Failed to query database", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var history []Types.Song
    for rows.Next() {
        var song Types.Song
        if err := rows.Scan(&song.ID, &song.Title, &song.Artist, &song.Album, &song.Path, &song.Duration, &song.TrackNumber); err != nil {
            http.Error(w, "Failed to scan row", http.StatusInternalServerError)
            log.Printf("Error scanning row: %v", err)
            return
        }
        history = append(history, song)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(history)
}