package playlist

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"
)

type Playlist struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	Cover  string `json:"cover"`
	Songs  string `json:"songs"`
}

func GetAllPlaylistsHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", "./db/database.db")
	if err != nil {
		http.Error(w, "Failed to open database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	rows, err := db.Query("SELECT id, name, cover, songs FROM Playlists")
	if err != nil {
		http.Error(w, "Failed to get playlists", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var playlists []Playlist
	for rows.Next() {
		var playlist Playlist
		err = rows.Scan(&playlist.ID, &playlist.Name, &playlist.Cover, &playlist.Songs)
		if err != nil {
			http.Error(w, "Failed to get playlists", http.StatusInternalServerError)
			return
		}
		playlists = append(playlists, playlist)
	}

	json.NewEncoder(w).Encode(playlists)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}

func CreatePlaylistHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", "./db/database.db")
	if err != nil {
		http.Error(w, "Failed to open database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	var playlist Playlist
	err = json.NewDecoder(r.Body).Decode(&playlist)
	if err != nil {
		http.Error(w, "Failed to decode request", http.StatusBadRequest)
		return
	}

	id := uuid.New().String()
	_, err = db.Exec("INSERT INTO Playlists (id, name, cover) VALUES (?, ?, ?)", id, playlist.Name, playlist.Cover)
	if err != nil {
		http.Error(w, "Failed to insert playlist", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func DeletePlaylistHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", "./db/database.db")
	if err != nil {
		http.Error(w, "Failed to open database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	id := r.URL.Query().Get("id")
	_, err = db.Exec("DELETE FROM Playlists WHERE id = ?", id)
	if err != nil {
		http.Error(w, "Failed to delete playlist", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func AddSongToPlaylistHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", "./db/database.db")
	if err != nil {
		http.Error(w, "Failed to open database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	playlistId := r.URL.Query().Get("playlist")
	songId := r.URL.Query().Get("song")

	var playlist Playlist
	err = db.QueryRow("SELECT id, name, cover, songs FROM Playlists WHERE id = ?", playlistId).Scan(&playlist.ID, &playlist.Name, &playlist.Cover, &playlist.Songs)
	if err != nil {
		http.Error(w, "Playlist not found", http.StatusNotFound)
		return
	}

	playlist.Songs += "," + songId
	_, err = db.Exec("UPDATE Playlists SET songs = ? WHERE id = ?", playlist.Songs, playlistId)
	if err != nil {
		http.Error(w, "Failed to add song to playlist", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func RemoveSongFromPlaylistHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", "./db/database.db")
	if err != nil {
		http.Error(w, "Failed to open database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	playlistId := r.URL.Query().Get("playlist")
	songId := r.URL.Query().Get("song")

	var playlist Playlist
	err = db.QueryRow("SELECT id, name, cover, songs FROM Playlists WHERE id = ?", playlistId).Scan(&playlist.ID, &playlist.Name, &playlist.Cover, &playlist.Songs)
	if err != nil {
		http.Error(w, "Playlist not found", http.StatusNotFound)
		return
	}

	playlist.Songs = playlist.Songs + ","
	playlist.Songs = strings.Replace(playlist.Songs, ","+songId+",", ",", -1)
	playlist.Songs = strings.TrimRight(playlist.Songs, ",")
	_, err = db.Exec("UPDATE Playlists SET songs = ? WHERE id = ?", playlist.Songs, playlistId)
	if err != nil {
		http.Error(w, "Failed to remove song from playlist", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func GetPlaylistHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", "./db/database.db")
	if err != nil {
		http.Error(w, "Failed to open database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	id := r.URL.Query().Get("id")

	var playlist Playlist
	err = db.QueryRow("SELECT id, name, cover, songs FROM Playlists WHERE id = ?", id).Scan(&playlist.ID, &playlist.Name, &playlist.Cover, &playlist.Songs)
	if err != nil {
		http.Error(w, "Playlist not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(playlist)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}