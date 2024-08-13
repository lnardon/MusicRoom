package utils

import (
	"log"
	"strings"

	"github.com/bogem/id3v2"
)

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