package stats

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	Database "server/modules/database"
	Types "server/types"
)

type Song struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Duration    string `json:"duration"`
	TrackNumber int    `json:"track_number"`
	ReleaseDate string `json:"release_date"`
	Path        string `json:"path"`
	Lyrics      string `json:"lyrics"`
	Plays       int    `json:"plays"`
	Album       Album  `json:"album"`
	Artist      Artist `json:"artist"`
}

type Artist struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
	Plays  int    `json:"plays"`
}

type Album struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Cover       string `json:"cover"`
	ReleaseDate string `json:"release_date"`
	Artist      Artist `json:"artist"`
	Plays       int    `json:"plays"`
}

func GetStatsHandler(w http.ResponseWriter, r *http.Request) {
	db := Database.GetDB()

	songs := executeSongQuery(db)
	artists := executeArtistQuery(db)
	albums := executeAlbumQuery(db)
	allInfo := executeAllInfoQuery(db)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"songs":    songs,
		"artists":  artists,
		"albums":   albums,
		"all_info": allInfo,
	})
}

func executeAllInfoQuery(db *sql.DB) string {
	query := `
        SELECT COUNT(DISTINCT s.id) as songs, COUNT(DISTINCT a.id) as albums, COUNT(DISTINCT art.id) as artists
        FROM Songs s
        JOIN Albums a ON s.album = a.id
        JOIN Artists art ON a.artist = art.id
    `
	var songs, albums, artists int
	err := db.QueryRow(query).Scan(&songs, &albums, &artists)
	if err != nil {
		log.Printf("Database query error: %v", err)
		return ""
	}
	return fmt.Sprintf("%d songs, %d albums, %d artists", songs, albums, artists)
}

func executeSongQuery(db *sql.DB) []Song {
	query := `
        SELECT s.id, s.title, s.duration, s.track_number, s.release_date, s.path, s.lyrics, COALESCE(top_songs.plays, 0),
            a.id, a.title, a.cover, a.release_date,
            art.id, art.name, art.avatar
        FROM Songs s
        JOIN Albums a ON s.album = a.id
        JOIN Artists art ON a.artist = art.id
        LEFT JOIN (
            SELECT song, COUNT(*) as plays
            FROM History
            WHERE timestamp >= NOW() - INTERVAL '30 days'
            GROUP BY song
        ) as top_songs ON s.id = top_songs.song
        ORDER BY plays DESC
        LIMIT 32;
    `

	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Database query error: %v", err)
		return nil
	}
	defer rows.Close()

	var songs []Song
	for rows.Next() {
		var song Song
		var album Album
		var artist Artist
		err := rows.Scan(&song.ID, &song.Title, &song.Duration, &song.TrackNumber, &song.ReleaseDate, &song.Path, &song.Lyrics, &song.Plays,
			&album.ID, &album.Title, &album.Cover, &album.ReleaseDate,
			&artist.ID, &artist.Name, &artist.Avatar)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			return nil
		}
		album.Artist = artist
		song.Album = album
		song.Artist = artist
		songs = append(songs, song)
	}
	return songs
}

func executeArtistQuery(db *sql.DB) []Artist {
	query := `
        SELECT art.id, art.name, art.avatar, COALESCE(SUM(top_songs.plays), 0) as plays
        FROM Artists art
        JOIN Albums a ON art.id = a.artist
        JOIN Songs s ON a.id = s.album
        LEFT JOIN (
            SELECT song, COUNT(*) as plays
            FROM History
            WHERE timestamp >= NOW() - INTERVAL '30 days'
            GROUP BY song
        ) as top_songs ON s.id = top_songs.song
        GROUP BY art.id
        ORDER BY plays DESC
        LIMIT 5;
    `

	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Database query error: %v", err)
		return nil
	}
	defer rows.Close()

	var artists []Artist
	for rows.Next() {
		var artist Artist
		if err := rows.Scan(&artist.ID, &artist.Name, &artist.Avatar, &artist.Plays); err != nil {
			log.Printf("Error scanning row: %v", err)
			return nil
		}
		artists = append(artists, artist)
	}
	return artists
}

func executeAlbumQuery(db *sql.DB) []Album {
	query := `
        SELECT a.id, a.title, a.cover, a.release_date, art.id, art.name, art.avatar, COALESCE(SUM(top_songs.plays), 0) as plays
        FROM Albums a
        JOIN Artists art ON a.artist = art.id
        JOIN Songs s ON a.id = s.album
        LEFT JOIN (
            SELECT song, COUNT(*) as plays
            FROM History
            WHERE timestamp >= NOW() - INTERVAL '30 days'
            GROUP BY song
        ) as top_songs ON s.id = top_songs.song
        GROUP BY a.id
        ORDER BY plays DESC
        LIMIT 5;
    `

	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Database query error: %v", err)
		return nil
	}
	defer rows.Close()

	var albums []Album
	for rows.Next() {
		var album Album
		var artist Artist
		if err := rows.Scan(&album.ID, &album.Title, &album.Cover, &album.ReleaseDate, &artist.ID, &artist.Name, &artist.Avatar, &album.Plays); err != nil {
			log.Printf("Error scanning row: %v", err)
			return nil
		}
		album.Artist = artist
		albums = append(albums, album)
	}
	return albums
}

func GetHistoryHandler(w http.ResponseWriter, r *http.Request) {
	db := Database.GetDB()

	rows, err := db.Query(`SELECT s.id, s.title, a.name AS artist_name, a.id AS artist_id,
								al.id, al.title, s.path, s.duration, s.track_number
							FROM History h
							JOIN Songs s ON h.song = s.id
							JOIN Albums al ON s.album = al.id
							JOIN Artists a ON al.artist = a.id
							LIMIT 32`)

	if err != nil {
		http.Error(w, "Failed to query database", http.StatusInternalServerError)
		log.Print(err)
		return
	}
	defer rows.Close()

	var history []Types.Song
	albumsMap := make(map[string]Types.Album)

	for rows.Next() {
		var song Types.Song

		if err := rows.Scan(&song.ID, &song.Title, &song.Artist.Name, &song.Artist.ID, &song.Album.ID, &song.Album.Name, &song.Path, &song.Duration, &song.TrackNumber); err != nil {
			http.Error(w, "Failed to scan row", http.StatusInternalServerError)
			log.Printf("Error scanning row: %v", err)
			return
		}
		history = append(history, song)

		auxId := song.Album.ID

		if _, exists := albumsMap[auxId]; !exists {
			albumsMap[auxId] = Types.Album{
				ID:          auxId,
				Title:       song.Album.Name,
				Cover:       "",
				ReleaseDate: "",
				Artist: Types.SimpleArtistInfo{
					ID:   song.Artist.ID,
					Name: song.Artist.Name,
				},
				Songs: nil,
			}
		}
	}

	albums := make([]Types.Album, 0, len(albumsMap))
	for _, album := range albumsMap {
		albums = append(albums, album)
	}

	response := struct {
		Songs   []Types.Song  `json:"songs"`
		Albums  []Types.Album `json:"albums"`
		AllInfo string        `json:"all_info"`
	}{
		Songs:  history,
		Albums: albums,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
