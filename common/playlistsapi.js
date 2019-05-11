import axios from 'axios'

export async function getPlaylists(apiUrl, params) {
  const res = await axios.get(`${apiUrl}/playlists`, { params: params })
  const _data = res.data
  let playlists = []
  try {
    playlists = _data.map((item) => {
      return {
        playlistId: item.playlistId,
        title: item.title,
        tracks: Object.values(item.tracks).map((track) => {
          return Object.assign(track.info || {}, {
            position: track.position + 1,
            videoId: (track.info || {}).videoId,
            url: `https://www.youtube.com/watch?list=${item.playlistId}&v=${(track.info || {}).videoId}`,
            thumbnail_url: ((track.thumbnails || {}).medium || {}).url,
            playing: track.position === 0
          })
        })
      }
    })
    playlists.forEach((playlist) => {
      playlist.tracks.sort((a, b) => { return a.position - b.position })
      playlist.src = `https://www.youtube.com/embed/?list=${playlist.playlistId}&v=${playlist.tracks[0].videoId}`
      playlist.firstVideoId = playlist.tracks[0].videoId
    })
    return playlists
  } catch (error) {
    console.error(error)
  }
  return []
}
