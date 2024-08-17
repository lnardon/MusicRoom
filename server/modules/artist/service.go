package artist

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	Types "server/types"
)

type SimpleArtist struct {
	ID   string `json:"id"`
	Name string `json:"name"`
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

    var artists []SimpleArtist
    for rows.Next() {
        var artist SimpleArtist
        if err := rows.Scan(&artist.ID, &artist.Name); err != nil {
            http.Error(w, "Failed to scan row", http.StatusInternalServerError)
            return
        }
        artists = append(artists, artist)
    }

    jsonResponse, err := json.Marshal(artists)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write(jsonResponse)
}

func GetArtistHandler(w http.ResponseWriter, r *http.Request) {
	artistID := r.URL.Query().Get("artist")

	db, err := sql.Open("sqlite3", "./db/database.db")
	if err != nil {
		http.Error(w, "Failed to open database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

    artistName := ""
    err = db.QueryRow("SELECT name FROM Artists WHERE id = ?", artistID).Scan(&artistName)
    if err != nil {
        http.Error(w, "Failed to query artist", http.StatusInternalServerError)
        return
    }

	var artistInfo Types.ArtistInfo
	artistInfo.Name = artistName
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

	if len(albumIDs) > 0 {
		placeholders := make([]string, len(albumIDs))
		for i := range placeholders {
			placeholders[i] = "?"
		}
		placeholdersStr := strings.Join(placeholders, ",")
		query := `SELECT s.id, s.title, s.duration, s.track_number, a.name, al.title FROM Songs s 
				  JOIN Albums al ON s.album = al.id
				  JOIN Artists a ON al.artist = a.id
				  WHERE al.id IN (` + placeholdersStr + `) ORDER BY RANDOM() LIMIT 5`

		args := make([]interface{}, len(albumIDs))
		for i, id := range albumIDs {
			args[i] = id
		}

		songsRows, err := db.Query(query, args...)
		if err != nil {
			http.Error(w, "Failed to query songs", http.StatusInternalServerError)
			return
		}
		defer songsRows.Close()

		for songsRows.Next() {
			var song Types.Song
			if err := songsRows.Scan(&song.ID, &song.Title, &song.Duration, &song.TrackNumber, &song.Artist, &song.Album); err != nil {
				http.Error(w, "Error scanning songs", http.StatusInternalServerError)
				return
			}
			artistInfo.Songs = append(artistInfo.Songs, song)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artistInfo)
}