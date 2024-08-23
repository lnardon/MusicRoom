# [MusicRoom](https:/lucasnardon.com/)

An application to stream and manage you local music files. A Spotify like experience for you local files .... but better!!?

<img src="./demo.gif" style="width: 100%"/>

</br>

## How to use

### Build from source

1 - Clone the repository and build the Docker image:

```bash
git clone https://github.com/lnardon/MusicRoom.git && cd Hendrix && docker build -t MusicRoom .
```

2 - Start the container using the following command.

```bash
docker run -d -p 7777:7777 -v /path/to/music:/music MusicRoom
```

3 - Go to http://localhost:7777
