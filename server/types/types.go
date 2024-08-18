package types

type FileList struct {
    Files []string `json:"files"`
}

type ArtistInfo struct {
    ID     string `json:"id"`
    Name string   `json:"name"`
    Albums []Album `json:"albums"`
    Songs  []Song   `json:"songs"`
}

type Album struct {
    ID string `json:"id"`
    Title string `json:"title"`
    Cover string `json:"cover"`
    ReleaseDate string `json:"release_date"`
    Songs []Song `json:"songs"`
    Artist string `json:"artist"`
}

type Song struct {
    ID string `json:"id"`
    Title string `json:"title"`
    Artist string `json:"artist"`
    Album string `json:"album"`
    Path string `json:"path"`
    Duration string `json:"duration"`
    TrackNumber int `json:"track_number"`
}