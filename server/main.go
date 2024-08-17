package main

import (
	"fmt"
	"net/http"

	AlbumModule "server/modules/album"
	ArtistModule "server/modules/artist"
	SongModule "server/modules/song"
	StatsModule "server/modules/stats"
	Utils "server/utils"

	_ "github.com/mattn/go-sqlite3"
)

func main(){
    http.Handle("/", http.FileServer(http.Dir("../frontend/dist")))
    
    http.HandleFunc("/scan", Utils.ScanHandler)
    http.HandleFunc("/getAllFiles", Utils.GetAllFilesHandler)
    http.HandleFunc("/getAllArtists", ArtistModule.GetAllArtistsHandler)
    http.HandleFunc("/getAllAlbums", AlbumModule.GetAllAlbumsHandler)

    http.HandleFunc("/getArtist", ArtistModule.GetArtistHandler)
    http.HandleFunc("/getAlbum", AlbumModule.GetAlbumHandler)
    http.HandleFunc("/getSong", SongModule.GetSongHandler)
    http.HandleFunc("/getCover", AlbumModule.GetCoverHandler)

    http.HandleFunc("/getHistory", StatsModule.GetHistoryHandler)
    http.HandleFunc("/getStats", StatsModule.GetStatsHandler)


    PORT := ":7777"
    fmt.Printf("\nServer starting on port %s\n", PORT)
    http.ListenAndServe(PORT, nil)
}