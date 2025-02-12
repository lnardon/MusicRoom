package playlist

import (
	"encoding/json"
	"log"
	"net/http"

	Database "server/modules/database"
	Types "server/types"

	"github.com/google/uuid"
)

func GetAllPlaylistsHandler(w http.ResponseWriter, r *http.Request) {
	db := Database.GetDB()

	rows, err := db.Query("SELECT id, name, cover FROM Playlists")
	if err != nil {
		http.Error(w, "Failed to get playlists", http.StatusInternalServerError)
		log.Println(err)
		return
	}
	defer rows.Close()

	var playlists []Playlist
	for rows.Next() {
		var playlist Playlist
		err = rows.Scan(&playlist.ID, &playlist.Name, &playlist.Cover)
		if err != nil {
			http.Error(w, "Failed to get playlists", http.StatusInternalServerError)
			log.Println(err)
			return
		}
		playlists = append(playlists, playlist)
	}

	json.NewEncoder(w).Encode(playlists)
	w.Header().Set("Content-Type", "application/json")
}

func CreatePlaylistHandler(w http.ResponseWriter, r *http.Request) {
	db := Database.GetDB()

	var playlist Playlist
	err := json.NewDecoder(r.Body).Decode(&playlist)
	if err != nil {
		http.Error(w, "Failed to decode request", http.StatusBadRequest)
		return
	}

	id := uuid.New().String()
	_, err = db.Exec("INSERT INTO Playlists (id, name, cover) VALUES ($1, $2, $3)", id, playlist.Name, playlist.Cover)
	if err != nil {
		http.Error(w, "Failed to insert playlist", http.StatusInternalServerError)
		log.Println(err)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func DeletePlaylistHandler(w http.ResponseWriter, r *http.Request) {
	db := Database.GetDB()

	id := r.URL.Query().Get("id")
	_, err := db.Exec("DELETE FROM Playlists WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Failed to delete playlist", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func AddSongToPlaylistHandler(w http.ResponseWriter, r *http.Request) {
	db := Database.GetDB()

	var data map[string]string
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Failed to decode request", http.StatusBadRequest)
		return
	}

	playlistID := data["playlist_id"]
	songID := data["song_id"]

	_, err = db.Exec("INSERT INTO PlaylistSongs (playlist_id, song_id) VALUES ($1, $2)", playlistID, songID)
	if err != nil {
		http.Error(w, "Failed to add song to playlist", http.StatusInternalServerError)
		log.Println(err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func RemoveSongFromPlaylistHandler(w http.ResponseWriter, r *http.Request) {
	db := Database.GetDB()

	playlistID := r.URL.Query().Get("playlist_id")
	songID := r.URL.Query().Get("song_id")

	_, err := db.Exec("DELETE FROM PlaylistSongs WHERE playlist_id = $1 AND song_id = $2", playlistID, songID)
	if err != nil {
		http.Error(w, "Failed to remove song from playlist", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func GetPlaylistHandler(w http.ResponseWriter, r *http.Request) {
	db := Database.GetDB()

	id := r.URL.Query().Get("id")

	var playlist Playlist
	playlist.ID = id

	rows, err := db.Query(`
		SELECT s.id, s.title, s.duration, s.track_number, s.path, s.album,
			a.title, ar.id, ar.name
		FROM Songs s
		INNER JOIN PlaylistSongs ps ON s.id = ps.song_id
		INNER JOIN Albums a ON s.album = a.id
		INNER JOIN Artists ar ON a.artist = ar.id
		WHERE ps.playlist_id = $1`, id)
	if err != nil {
		http.Error(w, "Failed to retrieve playlist songs", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var songs []Types.Song
	for rows.Next() {
		var song Types.Song
		err = rows.Scan(&song.ID, &song.Title, &song.Duration, &song.TrackNumber, &song.Path, &song.Album.ID,
			&song.Artist.Name, &song.Artist.ID, &song.Artist.Name)
		if err != nil {
			http.Error(w, "Error reading song data", http.StatusInternalServerError)
			return
		}
		songs = append(songs, song)
	}
	if err = rows.Err(); err != nil {
		http.Error(w, "Error iterating song data", http.StatusInternalServerError)
		return
	}

	var playlistName, playlistCover string
	err = db.QueryRow("SELECT name, cover FROM Playlists WHERE id = $1", id).Scan(&playlistName, &playlistCover)
	if err != nil {
		http.Error(w, "Failed to retrieve playlist data", http.StatusInternalServerError)
		return
	}

	playlist.Name = playlistName
	playlist.Cover = playlistCover
	playlist.Songs = songs

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(playlist)
}

func EditPlaylistInfoHandler(w http.ResponseWriter, r *http.Request) {
	db := Database.GetDB()

	var playlist Playlist
	err := json.NewDecoder(r.Body).Decode(&playlist)
	if err != nil {
		http.Error(w, "Failed to decode request", http.StatusBadRequest)
		return
	}

	_, err = db.Exec("UPDATE Playlists SET name = $1, cover = $2 WHERE id = $3", playlist.Name, playlist.Cover, playlist.ID)
	if err != nil {
		http.Error(w, "Failed to update playlist", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
