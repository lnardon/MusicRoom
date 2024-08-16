package utils

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/bogem/id3v2"
	"github.com/faiface/beep/mp3"
	"github.com/google/uuid"
)

func PopulateDb(path string) {
	db, err := sql.Open("sqlite3", "./db/database.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	files, err := GetAllFilesInPath(path)
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		tag, err := id3v2.Open(file, id3v2.Options{Parse: true})
		if err != nil {
			log.Println("Error opening MP3 file:", err)
			continue
		}
		defer tag.Close()

		f, err := os.Open(file)
		if err != nil {
			fmt.Println(err)
			return
		}
		defer f.Close()

		streamer, format, err := mp3.Decode(f)
		if err != nil {
			fmt.Println(err)
			return
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

		songID := uuid.New().String()
		_, err = db.Exec("INSERT INTO Songs (id, title, duration, track_number, release_date, path, album, lyrics) VALUES (?, ?, ?, '0', ?, ?, ?, 'N/A')", songID, songTitle, duration, releaseDate, file, albumID)
		if err != nil {
			log.Println("Error inserting song:", err)
			continue
		}
	}
}


// This function updates the artists string in the MP3 files metadata to use a ; as separator instead of a /
// Example: "Artist1/Artist2" -> "Artist1;Artist2"
func UpdateArtistsString(path string) {
	files,err := GetAllFilesInPath(path)
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