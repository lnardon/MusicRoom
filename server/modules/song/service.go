package song

import (
	"database/sql"
	"log"
	"net/http"

	Types "server/types"

	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
)

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