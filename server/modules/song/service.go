package song

import (
	"encoding/json"
	"log"
	"net/http"

	Database "server/modules/database"
	Types "server/types"

	"github.com/google/uuid"
)

func GetAllSongsHandler(w http.ResponseWriter, r *http.Request) {
	db := Database.GetDB()

	rows, err := db.Query("SELECT id, title, album, duration, track_number, path FROM Songs")
	if err != nil {
		http.Error(w, "Failed to fetch songs", http.StatusInternalServerError)
		log.Printf("Error fetching songs: %v", err)
		return
	}
	defer rows.Close()

	var songs []Types.Song
	for rows.Next() {
		var song Types.Song
		err = rows.Scan(&song.ID, &song.Title, &song.Album.ID, &song.Duration, &song.TrackNumber, &song.Path)
		if err != nil {
			http.Error(w, "Failed to fetch songs", http.StatusInternalServerError)
			log.Printf("Error fetching songs: %v", err)
			return
		}
		songs = append(songs, song)
	}

	jsonResponse, err := json.Marshal(songs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}

func GetSongHandler(w http.ResponseWriter, r *http.Request) {
	file := r.URL.Query().Get("file")
	db := Database.GetDB()

	var song Types.Song
	err := db.QueryRow("SELECT id, title, album, duration, track_number, path FROM Songs WHERE id = $1", file).
		Scan(&song.ID, &song.Title, &song.Album.ID, &song.Duration, &song.TrackNumber, &song.Path)
	if err != nil {
		http.Error(w, "Song not found", http.StatusNotFound)
		log.Printf("Error fetching song: %v", err)
		return
	}

	historyId := uuid.New().String()
	_, err = db.Exec("INSERT INTO History (id, song, timestamp) VALUES ($1, $2, NOW())", historyId, song.ID)
	if err != nil {
		log.Printf("Error inserting into History table: %v", err)
	}

	w.Header().Set("Content-Type", "audio/mpeg")
	http.ServeFile(w, r, song.Path)
}
