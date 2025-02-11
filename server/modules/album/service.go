package album

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	_ "github.com/lib/pq"

	Database "server/modules/database"
	Types "server/types"

	"github.com/bogem/id3v2"
)

func GetAllAlbumsHandler(w http.ResponseWriter, r *http.Request) {
	db := Database.GetDB()

	rows, err := db.Query("SELECT id, title, cover, release_date FROM Albums")
	if err != nil {
		http.Error(w, "Failed to query database", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var albums []Types.Album
	for rows.Next() {
		var album Types.Album
		if err := rows.Scan(&album.ID, &album.Title, &album.Cover, &album.ReleaseDate); err != nil {
			http.Error(w, "Failed to scan row", http.StatusInternalServerError)
			return
		}
		albums = append(albums, album)
	}

	jsonResponse, _ := json.Marshal(albums)
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}

func GetAlbumHandler(w http.ResponseWriter, r *http.Request) {
	db := Database.GetDB()
	albumID := r.URL.Query().Get("album")

	var album Types.AlbumInfo
	var artist Types.SimpleArtistInfo

	err := db.QueryRow("SELECT id, title FROM Albums WHERE id = $1", albumID).Scan(&album.ID, &album.Title)
	if err != nil {
		http.Error(w, "Failed to query album", http.StatusInternalServerError)
		return
	}

	err = db.QueryRow("SELECT id, name FROM Artists WHERE id = (SELECT artist FROM Albums WHERE id = $1)", albumID).Scan(&artist.ID, &artist.Name)
	if err != nil {
		http.Error(w, "Failed to query artist", http.StatusInternalServerError)
		return
	}

	album.Artist = artist
	album.Cover = fmt.Sprintf("/album_covers/cover_%s.jpg", albumID)

	songs, err := fetchSongs(albumID)
	if err != nil {
		http.Error(w, "Failed to query songs", http.StatusInternalServerError)
		return
	}
	album.Songs = songs

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(album)
}

func fetchSongs(albumID string) ([]Types.Song, error) {
	db := Database.GetDB()

	rows, err := db.Query("SELECT id, title, duration, track_number, path FROM Songs WHERE album = $1", albumID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var songs []Types.Song
	for rows.Next() {
		var song Types.Song
		if err := rows.Scan(&song.ID, &song.Title, &song.Duration, &song.TrackNumber, &song.Path); err != nil {
			return nil, err
		}
		songs = append(songs, song)
	}
	return songs, nil
}

func GetCoverHandler(w http.ResponseWriter, r *http.Request) {
	db := Database.GetDB()
	file := r.URL.Query().Get("file")
	var albumName string

	err := db.QueryRow("SELECT title FROM Albums WHERE id = $1", file).Scan(&albumName)
	if err != nil {
		http.Error(w, "Error fetching album from database", http.StatusInternalServerError)
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
	db := Database.GetDB()
	var songPath string

	query := `SELECT s.path FROM Songs s JOIN Albums a ON s.album = a.id WHERE a.title = $1 LIMIT 1`
	if err := db.QueryRow(query, albumName).Scan(&songPath); err != nil {
		http.Error(w, "Error fetching song from database", http.StatusInternalServerError)
		return
	}

	tag, err := id3v2.Open(songPath, id3v2.Options{Parse: true})
	if err != nil {
		http.Error(w, "Error opening MP3 file", http.StatusInternalServerError)
		return
	}
	defer tag.Close()

	frames := tag.GetFrames(tag.CommonID("Attached picture"))
	for _, f := range frames {
		if pic, ok := f.(id3v2.PictureFrame); ok {
			w.Header().Set("Content-Type", "image/jpeg")
			w.Write(pic.Picture)
			return
		}
	}

	http.Error(w, "No cover found in ID3 metadata", http.StatusNotFound)
}
