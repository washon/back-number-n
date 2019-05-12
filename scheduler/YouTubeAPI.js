const axios = require('axios')

const YouTubeAPI = {
  API_KEY: () => {
    return process.env.YOUTUBE_API_KEY
  },

  getPlaylists: async (channelId) => {
    const playlists = []
    let hasNext = true
    let nextPageToken = null
    do {
      const params = {
        part: 'snippet',
        channelId: channelId, // 再生リストのID
        maxResults: 50,
        key: YouTubeAPI.API_KEY()
      }

      if (nextPageToken) {
        params.pageToken = nextPageToken
      }

      const res = await axios({
        method: 'GET',
        url: 'https://www.googleapis.com/youtube/v3/playlists',
        headers: { 'Content-Type': 'application/json' },
        params: params
      })

      res.data.items.forEach((e) => {
        playlists.push(e)
      })

      hasNext = ('nextPageToken' in res.data)
      nextPageToken = res.data.nextPageToken
    } while (hasNext)
    return playlists
  },

  getPlaylistItems: async (playlistId) => {
    const tracks = []
    let hasNext = true
    let nextPageToken = null
    do {
      const params = {
        part: 'snippet,contentDetails',
        playlistId: playlistId, // 再生リストのID
        maxResults: 10,
        key: YouTubeAPI.API_KEY()
      }

      if (nextPageToken) {
        params.pageToken = nextPageToken
      }

      const res = await axios(
        {
          method: 'GET',
          url: 'https://www.googleapis.com/youtube/v3/playlistItems',
          headers: { 'Content-Type': 'application/json' },
          params: params
        })

      res.data.items.forEach((e) => {
        tracks.push(e)
      })

      hasNext = ('nextPageToken' in res.data)
      nextPageToken = res.data.nextPageToken
    } while (hasNext)
    return tracks
  },

  getVideoInfo: async (videoId) => {
    const res = await axios(
      {
        method: 'GET',
        url: 'https://www.googleapis.com/youtube/v3/videos',
        headers: { 'Content-Type': 'application/json' },
        params: {
          part: 'snippet,contentDetails',
          id: videoId, // 再生リストのID
          maxResults: 1,
          key: YouTubeAPI.API_KEY()
        }
      })
    return res.data
  }

}

module.exports = YouTubeAPI
