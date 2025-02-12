package playlist

import Types "server/types"

type Playlist struct {
	ID    string       `json:"id"`
	Name  string       `json:"name"`
	Cover string       `json:"cover"`
	Songs []Types.Song `json:"songs"`
}
