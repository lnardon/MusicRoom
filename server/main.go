package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	Utils "server/utils"

	"github.com/bogem/id3v2"
	_ "github.com/mattn/go-sqlite3"
)

type FileList struct {
    Files []string `json:"files"`
}

func main(){
    http.Handle("/", http.FileServer(http.Dir("../frontend/dist")))

    http.HandleFunc("/getAllFiles", GetAllFilesHandler)

    http.HandleFunc("/getAllArtists", GetAllArtistsHandler)
    http.HandleFunc("/getAllAlbums", GetAllAlbumsHandler)

    http.HandleFunc("/getArtist", GetArtistHandler)
    http.HandleFunc("/getAlbum", GetAlbumHandler)
    http.HandleFunc("/getSong", GetSongHandler)
    http.HandleFunc("/getCover", GetCoverHandler)


    PORT := ":7777"

    fmt.Println("*")
    fmt.Println("**")
    fmt.Println("***")
    fmt.Printf("Server starting on port %s\n", PORT)
    fmt.Println("***")
    fmt.Println("**")
    fmt.Println("*")

    http.ListenAndServe(PORT, nil)
}

func GetAllFilesHandler(w http.ResponseWriter, r *http.Request){
    files, err := Utils.GetAllFilesInPath("/media/lucas/HDD1/Music/")
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    fileList := FileList{Files: files}
    jsonResponse, err := json.Marshal(fileList)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write(jsonResponse)
}

func GetAllArtistsHandler(w http.ResponseWriter, r *http.Request){
    db, err := sql.Open("sqlite3", "./db/database.db")
	if err != nil {
		http.Error(w, "Failed to open database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

    rows, err := db.Query("SELECT * FROM Artists")
    if err != nil {
        http.Error(w, "Failed to query database", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var artists []string
    for rows.Next() {
        var artist string
        if err := rows.Scan(&artist); err != nil {
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

func GetAllAlbumsHandler(w http.ResponseWriter, r *http.Request){
    files, err := Utils.GetAllFilesInPath("/media/lucas/HDD1/Music/")
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    albums := make(map[string]bool)
    for _, file := range files {
        tag, err := id3v2.Open(file, id3v2.Options{Parse: true})
        if err != nil {
            log.Println("Error opening MP3 file:", err)
            continue
        }
        defer tag.Close()

        album := tag.Album()
        if album != "" {
            albums[album] = true
        }
    }

    var albumList []string
    for album := range albums {
        albumList = append(albumList, album)
    }

    jsonResponse, err := json.Marshal(albumList)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write(jsonResponse)
}

func GetSongHandler(w http.ResponseWriter, r *http.Request){
    file := r.URL.Query().Get("file")
    
    coverURL := GetCover(file)
    w.Header().Set("Cover-URL", coverURL)
    http.ServeFile(w, r, file)
}

func GetCoverHandler(w http.ResponseWriter, r *http.Request){
    file := r.URL.Query().Get("file")
    tag, err := id3v2.Open(file, id3v2.Options{Parse: true})
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    frames := tag.GetFrames(tag.CommonID("Attached picture"))
    for _, f := range frames {
        pic, ok := f.(id3v2.PictureFrame)
        if ok {
            w.Header().Set("Content-Type", "image/jpeg")
            w.Write(pic.Picture)
            return
        }
    }
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

type Song struct {
    Title string `json:"title"`
    Artist string `json:"artist"`
    Album string `json:"album"`
    File string `json:"file"`
}

func GetAlbumHandler(w http.ResponseWriter, r *http.Request){
    album := r.URL.Query().Get("album")

    files, err := Utils.GetAllFilesInPath("/media/lucas/HDD1/Music/")
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    var songs []Song
    for _, file := range files {
        tag, err := id3v2.Open(file, id3v2.Options{Parse: true})
        if err != nil {
            log.Println("Error opening MP3 file:", err)
            continue
        }
        defer tag.Close()

        if tag.Album() == album {
            songs = append(songs, Song{
                Title: tag.Title(),
                Artist: tag.Artist(),
                Album: tag.Album(),
                File: file,
            })
        }
    }

    jsonResponse, err := json.Marshal(songs)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write(jsonResponse)
}

type ArtistInfo struct {
    Artist string   `json:"artist"`
    Albums []string `json:"albums"`
    Songs  []Song   `json:"songs"`
}

func GetArtistHandler(w http.ResponseWriter, r *http.Request) {
    artist := r.URL.Query().Get("artist")

    files, err := Utils.GetAllFilesInPath(fmt.Sprint("/media/lucas/HDD1/Music/", artist))
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    var songs []Song
    albumSet := make(map[string]bool)
    for _, file := range files {
        tag, err := id3v2.Open(file, id3v2.Options{Parse: true})
        if err != nil {
            log.Println("Error opening MP3 file:", err)
            continue
        }
        defer tag.Close()

        allSongsArtists := strings.Split(tag.Artist(), "/")
        for _, songArtist := range allSongsArtists {
            if songArtist == artist {
                song := Song{
                    Title:  tag.Title(),
                    Artist: tag.Artist(),
                    Album:  tag.Album(),
                    File:   file,
                }
                songs = append(songs, song)
                albumSet[song.Album] = true
            }
        }
    }

    albums := make([]string, 0, len(albumSet))
    for album := range albumSet {
        albums = append(albums, album)
    }

    artistInfo := ArtistInfo{
        Artist: artist,
        Albums: albums,
        Songs:  songs,
    }

    jsonResponse, err := json.Marshal(artistInfo)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write(jsonResponse)
}