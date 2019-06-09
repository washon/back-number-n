const YouTubeAPI = require('./YouTubeAPI')
require('dotenv').config()

const UpdateDB = {
  DEFAULT_CHANNEL_ID: process.env.DEFAULT_CHANNEL_ID,
  ROOT_KEY: 'v1',
  update: async (admin) => {
    const rootRef = admin.database().ref(UpdateDB.ROOT_KEY)
    const res = await UpdateDB.updatePlaylists(rootRef)
    return res
  },

  updatePlaylists: async (rootRef) => {
    const channelId = UpdateDB.DEFAULT_CHANNEL_ID
    const ytPlaylists = await YouTubeAPI.getPlaylists(channelId)

    const promises = []
    const MAX_COUNT = 3
    let count = 0
    for (const item of ytPlaylists) {
      if (count >= MAX_COUNT) {
        console.log('Stopping update playlists, cause too many updatable playlist.')
        return Promise.all(promises)
      }
      const playlistId = item.id

      // 実際のplaylistの中の動画数を取得
      count++ // etagで判定すればこのカウントはいらないけど、とりあえず。
      const playlistItems = await YouTubeAPI.getPlaylistItems(playlistId).catch((err) => {
        console.log(err)
      })

      // DBに保存されているplaylistの中での動画数を取得
      const queryTracks = rootRef.child('playlist_tracks').orderByKey().equalTo(playlistId)
      const ssTracks = await queryTracks.once('value')
      const ownTracks = ((ssTracks.val() || {})[playlistId] || {}).tracks || {}

      // javascriptで連想配列のlengthは取れない
      const ownTracksLength = (Object.keys(ownTracks) || []).length
      console.log(`cmp length : ${playlistItems.length} > ${ownTracksLength} = ${playlistItems.length > ownTracksLength}`)

      if (playlistItems.length > ownTracksLength) {
        count++
        console.log(`upsert playlist_tracks : ${playlistId}`)
        promises.push(UpdateDB.updatePlaylistItems(rootRef, playlistId, playlistItems, ownTracks))
      }

      const queryPlaylist = rootRef.child('playlists').orderByKey().equalTo(playlistId)
      const ssPlaylist = await queryPlaylist.once('value')
      if (!ssPlaylist.val()) {
        console.log(`add playlist info : ${playlistId}`)
        const playlistsRef = rootRef.child('playlists')
        playlistsRef.child(playlistId).set({
          kind: item.kind,
          playlistId: playlistId,
          channelTitle: item.snippet.channelTitle,
          title: item.snippet.title,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
          thumbnails: item.snippet.thumbnails
        })
      }
    }
    return Promise.all(promises)
  },

  updatePlaylistItems: (rootRef, playlistId, ytPlaylistItems, ownTracks) => {
    const promises = []
    for (const [index, item] of ytPlaylistItems.entries()) {
      const videoId = item.contentDetails.videoId
      if (ownTracks && videoId in ownTracks) {
        continue
      }

      promises.push(
        (
          async () => {
            const queryVideos = rootRef.child('videos').child(videoId)
            let videoInfo = await queryVideos.once('value')
            if (videoInfo.val() === null) {
              await UpdateDB.updateVideoInfo(rootRef, videoId)
              videoInfo = await queryVideos.once('value')
            }

            console.log(`add track ${videoId} into ${playlistId}`)
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
      thumbnails: item.snippet.thumbnails || {},

      duration: (item.contentDetails || {}).duration || ''
    })
    return 'resolved!'
  }
}

module.exports = UpdateDB
