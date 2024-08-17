package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	AlbumModule "server/modules/album"
	ArtistModule "server/modules/artist"
	SongModule "server/modules/song"
	StatsModule "server/modules/stats"
	Types "server/types"
	Utils "server/utils"

	"github.com/bogem/id3v2"
	_ "github.com/mattn/go-sqlite3"
)

func main(){
    http.Handle("/", http.FileServer(http.Dir("../frontend/dist")))
    
    http.HandleFunc("/scan", Utils.ScanHandler)
    http.HandleFunc("/getAllFiles", GetAllFilesHandler)
    http.HandleFunc("/getAllArtists", ArtistModule.GetAllArtistsHandler)
    http.HandleFunc("/getAllAlbums", AlbumModule.GetAllAlbumsHandler)

    http.HandleFunc("/getArtist", ArtistModule.GetArtistHandler)
    http.HandleFunc("/getAlbum", AlbumModule.GetAlbumHandler)
    http.HandleFunc("/getSong", SongModule.GetSongHandler)
    http.HandleFunc("/getCover", GetCoverHandler)

    http.HandleFunc("/getHistory", StatsModule.GetHistoryHandler)
    http.HandleFunc("/getStats", StatsModule.GetStatsHandler)


    PORT := ":7777"
    fmt.Printf("\nServer starting on port %s\n", PORT)
    http.ListenAndServe(PORT, nil)
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
