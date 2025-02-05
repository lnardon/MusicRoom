package main

import (
	"fmt"
	"net/http"

	AlbumModule "server/modules/album"
	ArtistModule "server/modules/artist"
	Auth "server/modules/auth"
	PlaylistModule "server/modules/playlist"
	SongModule "server/modules/song"
	StatsModule "server/modules/stats"
	Utils "server/utils"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	http.Handle("/", http.FileServer(http.Dir("../frontend/dist")))

	http.HandleFunc("/api/login", Auth.HandleLogin)
	http.HandleFunc("/api/signup", Auth.HandleSignUp)
	http.HandleFunc("/api/checkToken", Auth.VerifyJWT(Auth.HandleCheckToken))

	http.HandleFunc("/api/scan", Auth.VerifyJWT(Utils.ScanHandler))
	http.HandleFunc("/api/getAllFiles", Auth.VerifyJWT(Utils.GetAllFilesHandler))
	http.HandleFunc("/api/getAllSongs", Auth.VerifyJWT(SongModule.GetAllSongsHandler))
	http.HandleFunc("/api/getAllArtists", Auth.VerifyJWT(ArtistModule.GetAllArtistsHandler))
	http.HandleFunc("/api/getAllAlbums", Auth.VerifyJWT(AlbumModule.GetAllAlbumsHandler))

	http.HandleFunc("/api/getArtist", Auth.VerifyJWT(ArtistModule.GetArtistHandler))
	http.HandleFunc("/api/getAlbum", Auth.VerifyJWT(AlbumModule.GetAlbumHandler))
	http.HandleFunc("/api/getSong", SongModule.GetSongHandler)
	http.HandleFunc("/api/getCover", AlbumModule.GetCoverHandler)

	http.HandleFunc("/api/getAllPlaylists", Auth.VerifyJWT(PlaylistModule.GetAllPlaylistsHandler))
	http.HandleFunc("/api/createPlaylist", Auth.VerifyJWT(PlaylistModule.CreatePlaylistHandler))
	http.HandleFunc("/api/deletePlaylist", Auth.VerifyJWT(PlaylistModule.DeletePlaylistHandler))
	http.HandleFunc("/api/addSongToPlaylist", Auth.VerifyJWT(PlaylistModule.AddSongToPlaylistHandler))
	http.HandleFunc("/api/removeSongFromPlaylist", Auth.VerifyJWT(PlaylistModule.RemoveSongFromPlaylistHandler))
	http.HandleFunc("/api/getPlaylist", Auth.VerifyJWT(PlaylistModule.GetPlaylistHandler))
	http.HandleFunc("/api/editPlaylist", Auth.VerifyJWT(PlaylistModule.EditPlaylistInfoHandler))

	http.HandleFunc("/api/getHistory", Auth.VerifyJWT(StatsModule.GetHistoryHandler))
	http.HandleFunc("/api/getStats", Auth.VerifyJWT(StatsModule.GetStatsHandler))

	PORT := ":7777"
	fmt.Printf("\nServer starting on port %s\n", PORT)
	http.ListenAndServe(PORT, nil)
}
