const YouTubeAPI = require('./YouTubeAPI')
require('dotenv').config()

const UpdateDB = {
  DEFAULT_CHANNEL_ID: process.env.DEFAULT_CHANNEL_ID,
  ROOT_KEY: 'v1',
  update: async (admin) => {
    let ownPlaylists = []

    const rootRef = admin.database().ref(UpdateDB.ROOT_KEY)
    const query = rootRef.child('playlists').orderByChild('publishedAt')
    const snapshot = await query.once('value')
    snapshot.forEach((childSnapshot) => {
      const playlist = childSnapshot.val()
      ownPlaylists.push(playlist)
    })
    ownPlaylists = ownPlaylists.reverse()

    return UpdateDB.updatePlaylists(rootRef, ownPlaylists)
  },

  updatePlaylists: async (rootRef, ownPlaylists) => {
    const channelId = UpdateDB.DEFAULT_CHANNEL_ID
    const ytPlaylists = await YouTubeAPI.getPlaylists(channelId)

    const promises = []
    const MAX_COUNT = 10
    let count = 0
    for (const item of ytPlaylists.items) {
      if (count > MAX_COUNT) {
        console.log('Stopping update playlists, cause too many updatable playlist.')
        return Promise.all(promises)
      }

      const hasPlaylist = (ownPlaylists || []).some(e => (e.playlistId === item.id))
      if (!hasPlaylist) {
        count++
        console.log(`add Playlist : ${item.id}`)

        const playlistsRef = rootRef.child('playlists')
        playlistsRef.child(item.id).set({
          kind: item.kind,
          playlistId: item.id,
          channelTitle: item.snippet.channelTitle,
          title: item.snippet.title,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
          thumbnails: item.snippet.thumbnails
        })

        promises.push(UpdateDB.updatePlaylistItems(rootRef, item.id))
      }
    }
    return Promise.all(promises)
  },

  updatePlaylistItems: async (rootRef, playlistId) => {
    const query = rootRef.child('playlist_tracks').orderByKey().equalTo(playlistId)
    const snapshot = await query.once('value')
    if ((snapshot.val() || {}).tracks !== undefined) {
      return
    }
    const playlistItems = await YouTubeAPI.getPlaylistItems(playlistId).catch((err) => {
      console.log(err)
    })

    const promises = []
    for (const [index, item] of playlistItems.items.entries()) {
      const videoId = item.contentDetails.videoId

      promises.push(
        (
          async () => {
            const queryVideos = rootRef.child('videos').child(videoId)
            let videoInfo = await queryVideos.once('value')
            if (videoInfo.val() === null) {
              await UpdateDB.updateVideoInfo(rootRef, videoId)
              videoInfo = await queryVideos.once('value')
            }

            const tracksRef = rootRef.child('playlist_tracks').child(playlistId).child('tracks')
            await tracksRef.child(videoId).set({
              position: index,
              info: videoInfo.val() || {}
            })
          }
        )() // asyncだけだと関数を渡していることになる。無名関数を実行して上げる必要があるので注意
      )
    }
    return Promise.all(promises)
  },

  updateVideoInfo: async (rootRef, videoId) => {
    const videos = await YouTubeAPI.getVideoInfo(videoId).catch((err) => {
      console.log(err)
    })
    if (!videos || !videos.items[0]) {
      console.log(`This video might have been not unavailable. : ${videoId}`)
      return
    }
    const item = videos.items[0]
    console.log(`add videoInfo : ${item.id} `)

    const videoRef = rootRef.child('videos').child(videoId)
    await videoRef.update({
      kind: item.kind,
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,

      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,

      tags: item.snippet.tags || [],
      publishedAt: item.snippet.publishedAt || '',
      thumbnails: item.snippet.thumbnails || {}
    })
    return 'resolved!'
  }
}

module.exports = UpdateDB
