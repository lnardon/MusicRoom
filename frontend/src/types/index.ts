export interface Track {
  id: string;
  title: string;
  artist: Artist;
  cover: string;
  album: string;
  file: string;
  duration: string;
}

export interface Album {
  id: string;
  title: string;
  artist: Artist;
  cover: string;
  year: string;
  genre: string;
  tracks: Track[];
}

export interface Artist {
  id: string;
  name: string;
}
