<template>
  <section class="section">
    <div class="columns is-mobile">
      <div>
        <div v-for="playlist of playlists" :key="playlist.id">
          <h3>
            {{ playlist.title }}
          </h3>
          <iframe
            class="iframe-youtube"
            :src="playlist.src"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
          <div class="nnn-yt-playlist-items">
            <a
              v-for="track of playlist.tracks"
              :key="track.position"
              :href="track.url"
              class="nnn-yt-playlist-item"
              target="_blank"
            >
              <div class="nnn-yt-playlist-id">{{ track.position }}</div>
              <div
                class="nnn-yt-playlist-thumbnail"
                :style="{ background: 'url(' + track.thumbnail_url + ';)' }"
              />
              <div class="nnn-yt-playlist-title">{{ track.title }}</div>
              <div class="nnn-yt-playlist-channel-title">{{ track.channelTitle }} </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios'

export default {
  name: 'HomePage',
  async asyncData() {
    const apiUrl = process.env.BNN_API_URL

    const res = await axios.get(`${apiUrl}/playlists`)
    console.log(res)
    const _data = res.data
    console.log(_data)
    const playlists = _data.map((item) => {
      return {
        playlistId: item.playlistId,
        title: item.title,
        tracks: Object.values(item.tracks).map((track) => {
          return Object.assign(track.info || {}, {
            position: track.position + 1,
            url: `https://www.youtube.com/watch?v=${(track.info || {}).videoId}`,
            thumbnail_url: ((track.thumbnails || {}).medium || {}).url
          })
        })
      }
    })
    console.log(playlists)
    playlists.forEach((playlist) => {
      playlist.tracks.sort((a, b) => { return a.position - b.position })
      playlist.src = `https://www.youtube.com/embed/?list=${playlist.playlistId}&v=${playlist.tracks[0].videoId}`
    })
    console.log(playlists)

    return { playlists }
  }
}
</script>

<style scoped>

.nnn-yt-playlist-t {
    color: #141414;
    font-family: auto;
}

.nnn-yt-playlist-item {
    background-color: rgba(0, 0, 0, 0.89);
    height: 44px;
    display: block;
    color: white;
}

.nnn-yt-playlist-item:hover {
    background-color: rgba(0, 0, 0, 0.7);
    height: 44px;
}

.nnn-yt-playlist-id {
    float: left;
    width: 30px;
    height: 44px;
    line-height: 44px;
    font-family: auto;
    padding-left: 10px;
    font-size: 80%;
    text-align: right;
    padding-right: 5px;
}
.nnn-yt-playlist-thumbnail {
    width: 64px;
    height: 36px;
    float: left;
    margin: 4px 8px;
    background-size: 64px 48px;
    background-position: center;
}

.nnn-yt-playlist-title {
    font-family: auto;
    padding-left: 10px;
    font-size: 80%;
}
.nnn-yt-playlist-channel-title {
    font-family: auto;
    padding-left: 10px;
    font-size: 50%;
    color: #bbb;
}

</style>
