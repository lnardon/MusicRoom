package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type FileList struct {
    Files []string `json:"files"`
}

func main(){
    http.Handle("/", http.FileServer(http.Dir("../frontend/dist")))

    http.HandleFunc("/getAllFiles", GetAllFilesHandler)
    http.HandleFunc("/getSong", GetSongHandler)

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
    http.ServeFile(w, r, file)
}