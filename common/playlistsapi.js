import axios from 'axios'

// flatのpolyfillがieとedgeに必要だった...
if (!Array.prototype.flat) {
  Array.prototype.flat = function (depth) {
    const flattend = [];
    (function flat(array, depth) {
      for (const el of array) {
        if (Array.isArray(el) && depth > 0) {
          flat(el, depth - 1)
        } else {
          flattend.push(el)
        }
      }
    })(this, Math.floor(depth) || 1)
    return flattend
  }
}

export async function getPlaylists(apiUrl, params) {
  const res = await axios.get(`${apiUrl}/playlists`, { params: params })
  const _data = res.data
  let playlists = []
  try {
    playlists = _data.map((item) => {
      return {
        playlistId: item.playlistId,
        title: item.title,
        publishedAt: item.publishedAt,
        tracks: Object.values(item.tracks).map((track) => {
          const trackInfo = track.info || {}
          return Object.assign(trackInfo, {
            position: track.position + 1,
            videoId: trackInfo.videoId,
            title: trackInfo.title || 'unreachable',
            channelTitle: trackInfo.channelTitle || 'unreachable',
            url: `https://www.youtube.com/watch?list=${item.playlistId}&v=${trackInfo.videoId}`,
            thumbnail_url: ((track.thumbnails || {}).medium || {}).url,
            playing: track.position === 0,
            durationSec: PT2Seconds(trackInfo.duration),
            durationStr: sec2str(PT2Seconds(trackInfo.duration)),
            tags: trackInfo.tags
          })
        })
      }
    })
    playlists.forEach((playlist) => {
      playlist.tracks.sort((a, b) => { return a.position - b.position })
      playlist.src = `https://www.youtube.com/embed/?list=${playlist.playlistId}&v=${playlist.tracks[0].videoId}`
      playlist.url = `https://www.youtube.com/watch?list=${playlist.playlistId}&v=${playlist.tracks[0].videoId}`
      playlist.firstVideoId = playlist.tracks[0].videoId
      playlist.totalDuration = playlist.tracks
        .map((e) => { return e.durationSec })
        .reduce((p, c) => { return p + c })
      playlist.totalDurationStr = sec2str(playlist.totalDuration)

      const pattern = /[ ’':：！？!?「」『』【】()[\]/、。,.]/
      playlist.tags = playlist.tracks.map((track) => {
        const tags = ((track || {}).tags || [])
          .concat([track.title.split(pattern)])
          .flat()
          .filter((x, i, self) => {
            return !(x === '' || self.some((e, is) => {
              if (i <= is || e === '') {
                return false
              }
              if (/[()]/.test(x)) {
                return true
              }
              return x.toLowerCase().includes(e.toLowerCase())
            }))
          }).join(',')
          .replace(new RegExp('、', 'g'), ',').split(',')
        // console.log(tags)
        return tags
      }).flat()
      // console.log(playlist.title)
      // console.log(playlist.tags)
      // console.log(playlist.tags.join(' '))
    })
    // console.log(playlists)
    return playlists
  } catch (error) {
    console.error(error)
  }
  return []
}

function sec2str(seconds) {
  const s = Math.floor(seconds % 60)
  const m = Math.floor(((seconds - s) / 60) % 60)
  const h = Math.floor((seconds - s - m * 60) / 3600)

  const sstr = s >= 10 ? `${s}` : `0${s}`
  if (h > 0) {
    const mstr = m >= 10 ? `${m}` : `0${m}`
    return `${h}:${mstr}:${sstr}`
  }
  return `${m}:${sstr}`
}

function PT2Seconds(iso8601PT) {
  if (!iso8601PT) {
    return 0
  }
  const reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/
  let hours = 0
  let minutes = 0
  let seconds = 0
  let totalseconds

  if (reptms.test(iso8601PT)) {
    const matches = reptms.exec(iso8601PT)
    if (matches[1]) hours = Number(matches[1])
    if (matches[2]) minutes = Number(matches[2])
    if (matches[3]) seconds = Number(matches[3])
    totalseconds = hours * 3600 + minutes * 60 + seconds
  }

  return totalseconds
}
