package utils

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	Types "server/types"
)

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

func GetAllFilesHandler(w http.ResponseWriter, r *http.Request){
    files, err := GetAllFilesInPath("/media/lucas/HDD1/Music/")
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