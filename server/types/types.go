package types

type FileList struct {
    Files []string `json:"files"`
}

type ArtistInfo struct {
    Artist string   `json:"artist"`
    Albums []string `json:"albums"`
    Songs  []Song   `json:"songs"`
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