package metadata

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/bogem/id3v2"
)

type FileMeta struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Artist      string `json:"artist"`
	Album       string `json:"album"`
	TrackNumber string `json:"track_number"`
	ReleaseDate string `json:"release_date"`
	Lyrics      string `json:"lyrics"`

}

func UpdateFileMetadataHandler(w http.ResponseWriter, r *http.Request){
	var req FileMeta
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Error parsing JSON body", http.StatusBadRequest)
        return
    }
    defer r.Body.Close()

	db, err := sql.Open("sqlite3", "./db/database.db")
	if err != nil {
		http.Error(w, "Failed to open database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	var filePath string
	err = db.QueryRow("SELECT path FROM Songs WHERE id = ?", req.ID).Scan(&filePath)
	if err != nil {
		http.Error(w, "Failed to query file path", http.StatusInternalServerError)
		return
	}

	tag, err := id3v2.Open(filePath, id3v2.Options{Parse: true})
	if err != nil {
		log.Println("Error opening MP3 file:", err)
		http.Error(w, "Failed to open MP3 file", http.StatusInternalServerError)
		return
	}
	defer tag.Close()

	tag.SetArtist(req.Artist)
	tag.SetAlbum(req.Album)
	tag.SetTitle(req.Title)
	tag.SetYear(req.ReleaseDate)
	tag.AddTextFrame(tag.CommonID("Lyrics"), tag.DefaultEncoding(), req.Lyrics)
	tag.AddTextFrame("TRCK", tag.DefaultEncoding(), fmt.Sprintf("%s/%s", strings.Split(req.TrackNumber, "/")[0], strings.Split(req.TrackNumber, "/")[1]))
	if err := tag.Save(); err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}
	defer tag.Close()

	w.WriteHeader(http.StatusOK)
}