package utils

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/bogem/id3v2"
	"github.com/faiface/beep/mp3"
	"github.com/google/uuid"
)

func ScanHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", "./db/database.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	files, err := GetAllFilesInPath(FOLDER_PATH)
	if err != nil {
		log.Fatal(err)
	}

	unable_to_open := make([]string, 0)
	error_decoding := make([]string, 0)

	for idx, file := range files {
		fmt.Println("Processing file:", idx, "of", len(files))
		tag, err := id3v2.Open(file, id3v2.Options{Parse: true})
		if err != nil {
			log.Println("Error opening MP3 file:", err, file)
			unable_to_open = append(unable_to_open, file)
			continue
		}
		defer tag.Close()

		f, err := os.Open(file)
		if err != nil {
			fmt.Println(err, "Error opening file:", file)
			return
		}
		defer f.Close()

		streamer, format, err := mp3.Decode(f)
		if err != nil {
			fmt.Println("Error decoding file:", file, err)
			error_decoding = append(error_decoding, file)
			continue
		}
		defer streamer.Close()

		fileDurationSeconds := streamer.Len() / format.SampleRate.N(time.Second)
		formatedDuration := fmt.Sprintf("%02d:%02d", fileDurationSeconds/60, fileDurationSeconds%60)

		artistID, albumID := "", ""
		artistName := strings.Split(tag.Artist(), "/")[0]
		albumTitle := tag.Album()
		songTitle := tag.Title()
		duration := formatedDuration
		releaseDate := tag.Year()

		if songTitle == "" {
			songTitle = strings.TrimSuffix(strings.Split(file, "/")[len(strings.Split(file, "/"))-1], ".mp3")
		}

		err = db.QueryRow("SELECT id FROM Artists WHERE name = ?", artistName).Scan(&artistID)
		if err == sql.ErrNoRows {
			artistID = uuid.New().String()
			_, err = db.Exec("INSERT INTO Artists (id, name, avatar, albums) VALUES (?, ?, '', '')", artistID, artistName)
			if err != nil {
				log.Println("Error inserting artist:", err)
				continue
			}
		}

		err = db.QueryRow("SELECT id FROM Albums WHERE title = ? AND artist = ?", albumTitle, artistID).Scan(&albumID)
		if err == sql.ErrNoRows {
			albumID = uuid.New().String()
			_, err = db.Exec("INSERT INTO Albums (id, title, cover, release_date, artist) VALUES (?, ?, '', ?, ?)", albumID, albumTitle, releaseDate, artistID)
			if err != nil {
				log.Println("Error inserting album:", err)
				continue
			}
		}

		var existingSongID string
		var path string
		err = db.QueryRow("SELECT id, path FROM Songs WHERE title = ? AND album = ?", songTitle, albumID).Scan(&existingSongID, &path)
		if err == sql.ErrNoRows {
			songID := uuid.New().String()
			_, err = db.Exec("INSERT INTO Songs (id, title, duration, track_number, release_date, path, album, lyrics) VALUES (?, ?, ?, '0', ?, ?, ?, 'N/A')", songID, songTitle, duration, releaseDate, file, albumID)
			if err != nil {
				log.Println("Error inserting song:", err)
				continue
			}
			log.Println("Inserted song with ID:", songID, "Title:", songTitle)
		} else {
			if path != file {
				log.Println("Song path has changed, updating path...")
				_, err = db.Exec("UPDATE Songs SET path = ? WHERE id = ?", file, existingSongID)
				if err != nil {
					log.Println("Error updating song path:", err)
					continue
				}
			} else {
				log.Println("Song already exists, skipping...")
			}
		}
	}

	if len(unable_to_open) > 0 {
		log.Println("\n\nUnable to open the files: ")
		for idx, file := range unable_to_open {
			fmt.Printf("%d - %s\n", idx, file)
		}
	}

	if len(error_decoding) > 0 {
		log.Println("\n\nThere was an error decoding the tag info from the files: ")
		for idx, file := range error_decoding {
			fmt.Printf("%d - %s\n", idx, file)
		}
	}

	w.Write([]byte("Done"))
}
