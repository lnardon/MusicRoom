package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/bogem/id3v2"
)

type FileList struct {
    Files []string `json:"files"`
}

func main(){
    http.Handle("/", http.FileServer(http.Dir("../frontend/dist")))

    http.HandleFunc("/getAllFiles", GetAllFilesHandler)

    http.HandleFunc("/getAllArtists", GetAllArtistsHandler)
    http.HandleFunc("/getAllAlbums", GetAllAlbumsHandler)

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
    files, err := getAllFilesInPath("/media/lucas/HDD1/Music/")
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
    files, err := getAllFilesInPath("/media/lucas/HDD1/Music/")
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    artists := make(map[string]bool)
    for _, file := range files {
        tag, err := id3v2.Open(file, id3v2.Options{Parse: true})
        if err != nil {
            log.Println("Error opening MP3 file:", err)
            continue
        }
        defer tag.Close()

        allSongsArtists := strings.Split(tag.Artist(), "/")
        for _, artist := range allSongsArtists {
            if artist != "" {
                artists[artist] = true
            }
        }
    }

    var artistList []string
    for artist := range artists {
        artistList = append(artistList, artist)
    }

    jsonResponse, err := json.Marshal(artistList)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write(jsonResponse)
}

func GetAllAlbumsHandler(w http.ResponseWriter, r *http.Request){
    files, err := getAllFilesInPath("/media/lucas/HDD1/Music/")
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

func getAllFilesInPath(path string) ([]string, error) {
	var files []string
	err := filepath.Walk(path, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(path, ".mp3") {
			files = append(files, path)
		}
		return nil
	})
	return files, err
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
	files, err := getAllFilesInPath(path)
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

func GetAlbumHandler(w http.ResponseWriter, r *http.Request){
    album := r.URL.Query().Get("album")

    files, err := getAllFilesInPath("/media/lucas/HDD1/Music/")
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    var songs []string
    for _, file := range files {
        tag, err := id3v2.Open(file, id3v2.Options{Parse: true})
        if err != nil {
            log.Println("Error opening MP3 file:", err)
            continue
        }
        defer tag.Close()

        if tag.Album() == album {
            songs = append(songs, file)
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