package album

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	Database "server/modules/database"
	Types "server/types"

	"github.com/bogem/id3v2"
	_ "github.com/lib/pq"
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
		findAndServeAlbumCoverFromDB(w, r, albumName)
	} else {
		serveCoverFileWithETag(w, r, coverPath, file)
	}
}

func findAndServeAlbumCoverFromDB(w http.ResponseWriter, r *http.Request, albumName string) {
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
			hash := sha256.Sum256(pic.Picture)
			etag := fmt.Sprintf(`"%s"`, hex.EncodeToString(hash[:16])) // Use first 16 bytes for shorter ETag

			if ifNoneMatch := r.Header.Get("If-None-Match"); ifNoneMatch != "" {
				etagValue := strings.Trim(etag, `"`)
				for _, match := range strings.Split(ifNoneMatch, ",") {
					match = strings.TrimSpace(match)
					match = strings.Trim(match, `"`)
					if match == etagValue {
						w.WriteHeader(http.StatusNotModified)
						return
					}
				}
			}

			w.Header().Set("Content-Type", "image/jpeg")
			w.Header().Set("ETag", etag)
			w.Header().Set("Cache-Control", "public, max-age=31536000") // 1 year
			w.Write(pic.Picture)
			return
		}
	}

	http.Error(w, "No cover found in ID3 metadata", http.StatusNotFound)
}

func serveCoverFileWithETag(w http.ResponseWriter, r *http.Request, coverPath string, albumID string) {
	fileInfo, err := os.Stat(coverPath)
	if err != nil {
		http.Error(w, "Error reading cover file", http.StatusInternalServerError)
		return
	}

	etagData := fmt.Sprintf("%s-%d-%d", albumID, fileInfo.ModTime().Unix(), fileInfo.Size())
	hash := sha256.Sum256([]byte(etagData))
	etag := fmt.Sprintf(`"%s"`, hex.EncodeToString(hash[:16])) // Use first 16 bytes for shorter ETag

	if ifNoneMatch := r.Header.Get("If-None-Match"); ifNoneMatch != "" {
		etagValue := strings.Trim(etag, `"`)
		for _, match := range strings.Split(ifNoneMatch, ",") {
			match = strings.TrimSpace(match)
			match = strings.Trim(match, `"`)
			if match == etagValue {
				w.WriteHeader(http.StatusNotModified)
				return
			}
		}
	}

	w.Header().Set("ETag", etag)
	w.Header().Set("Cache-Control", "public, max-age=31536000") // 1 year
	w.Header().Set("Last-Modified", fileInfo.ModTime().Format(time.RFC1123))

	if ifModifiedSince := r.Header.Get("If-Modified-Since"); ifModifiedSince != "" {
		if t, err := time.Parse(time.RFC1123, ifModifiedSince); err == nil {
			if fileInfo.ModTime().Before(t.Add(time.Second)) {
				w.WriteHeader(http.StatusNotModified)
				return
			}
		}
	}

	http.ServeFile(w, r, coverPath)
}
