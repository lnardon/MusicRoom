package main

import (
	"fmt"
	"net/http"

	AlbumModule "server/modules/album"
	ArtistModule "server/modules/artist"
	MetadataModule "server/modules/metadata"
	PlaylistModule "server/modules/playlist"
	SongModule "server/modules/song"
	StatsModule "server/modules/stats"
	Utils "server/utils"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	http.Handle("/", http.FileServer(http.Dir("../frontend/dist")))

	http.HandleFunc("/api/scan", Utils.ScanHandler)
	http.HandleFunc("/api/getAllFiles", Utils.GetAllFilesHandler)
	http.HandleFunc("/api/getAllSongs", SongModule.GetAllSongsHandler)
	http.HandleFunc("/api/getAllArtists", ArtistModule.GetAllArtistsHandler)
	http.HandleFunc("/api/getAllAlbums", AlbumModule.GetAllAlbumsHandler)

	http.HandleFunc("/api/getArtist", ArtistModule.GetArtistHandler)
	http.HandleFunc("/api/getAlbum", AlbumModule.GetAlbumHandler)
	http.HandleFunc("/api/getSong", SongModule.GetSongHandler)
	http.HandleFunc("/api/getCover", AlbumModule.GetCoverHandler)

	http.HandleFunc("/api/getAllPlaylists", PlaylistModule.GetAllPlaylistsHandler)
	http.HandleFunc("/api/createPlaylist", PlaylistModule.CreatePlaylistHandler)
	http.HandleFunc("/api/deletePlaylist", PlaylistModule.DeletePlaylistHandler)
	http.HandleFunc("/api/addSongToPlaylist", PlaylistModule.AddSongToPlaylistHandler)
	http.HandleFunc("/api/removeSongFromPlaylist", PlaylistModule.RemoveSongFromPlaylistHandler)
	http.HandleFunc("/api/getPlaylist", PlaylistModule.GetPlaylistHandler)
	http.HandleFunc("/api/editPlaylist", PlaylistModule.EditPlaylistInfoHandler)

	http.HandleFunc("/api/getHistory", StatsModule.GetHistoryHandler)
	http.HandleFunc("/api/getStats", StatsModule.GetStatsHandler)

	http.HandleFunc("/api/editMetadata", MetadataModule.UpdateFileMetadataHandler)

	PORT := ":7777"
	fmt.Printf("\nServer starting on port %s\n", PORT)
	http.ListenAndServe(PORT, nil)
}
