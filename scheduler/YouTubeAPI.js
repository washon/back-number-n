const axios = require('axios')

const YouTubeAPI = {
  API_KEY: () => {
    return process.env.YOUTUBE_API_KEY
  },

  getPlaylists: async (channelId) => {
    const res = await axios(
      {
        method: 'GET',
        url: 'https://www.googleapis.com/youtube/v3/playlists',
        headers: { 'Content-Type': 'application/json' },
        params: {
          part: 'snippet',
          channelId: channelId, // 再生リストのID
          maxResults: 50,
          key: YouTubeAPI.API_KEY()
        }
      })
    return res.data
  },

  getPlaylistItems: async (playlistId) => {
    const res = await axios(
      {
        method: 'GET',
        url: 'https://www.googleapis.com/youtube/v3/playlistItems',
        headers: { 'Content-Type': 'application/json' },
        params: {
          part: 'snippet,contentDetails',
          playlistId: playlistId, // 再生リストのID
          maxResults: 50,
          key: YouTubeAPI.API_KEY()
        }
      })
    return res.data
  },

  getVideoInfo: async (videoId) => {
    const res = await axios(
      {
        method: 'GET',
        url: 'https://www.googleapis.com/youtube/v3/videos',
        headers: { 'Content-Type': 'application/json' },
        params: {
          part: 'snippet',
          id: videoId, // 再生リストのID
          maxResults: 1,
          key: YouTubeAPI.API_KEY()
        }
      })
    return res.data
  }

}

module.exports = YouTubeAPI
