package playlist

type Playlist struct {
	ID     string    `json:"id"`
	Name   string `json:"name"`
	Cover  string `json:"cover"`
	Songs  []Song `json:"songs"`
}
type Song struct {
	ID           string `json:"id"`
	Title        string `json:"title"`
	Duration     string `json:"duration"`
	TrackNumber  int    `json:"track_number"`
	ReleaseDate  string `json:"release_date"`
	Path         string `json:"path"`
	Lyrics       string `json:"lyrics"`
	AlbumID      string `json:"album_id"`
	AlbumTitle   string `json:"album_title"`
	AlbumCover   string `json:"album_cover"`
	ArtistID     string `json:"artist_id"`
	ArtistName   string `json:"artist_name"`
	ArtistAvatar string `json:"artist_avatar"`
}