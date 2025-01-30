package utils

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	Types "server/types"

	"github.com/bogem/id3v2"
)

var FOLDER_PATH string = os.Getenv("MUSIC_PATH")

func GetAllFilesInPath(path string) ([]string, error) {
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

func GetAllFilesHandler(w http.ResponseWriter, r *http.Request) {
	files, err := GetAllFilesInPath(FOLDER_PATH)
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

// Example: "Artist1/Artist2" -> "Artist1;Artist2"
func UpdateArtistsString(path string) {
	files, err := GetAllFilesInPath(path)
	if err != nil {
		log.Println("Error getting files in path:", err)
		return
	}

	for _, file := range files {
		tag, err := id3v2.Open(file, id3v2.Options{Parse: true})
		if err != nil {
			log.Println("Error opening MP3 file:", err)
			continue
		}
		defer tag.Close()

		artist := tag.Artist()
		if artist != "" {
			tag.SetArtist(strings.Join(strings.Split(artist, "/"), ";"))
		}
	}

}
