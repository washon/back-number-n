<template>
  <section class="section">
    <div class="columns is-mobile">
      <div class="column">
        <ul>
          <li v-for="playlist of playlists" :key="playlist.playlistId">
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
          </li>
        </ul>
        <infinite-loading
          ref="infiniteLoading"
          spinner="spiral"
          @infinite="infiniteHandler">
          <div slot="no-results"/>
        </infinite-loading>
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
    const res = await axios.get(`${apiUrl}/playlists`, {
      params: {
        from: 0,
        to: 5
      }
    })
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
              url: `https://www.youtube.com/watch?v=${(track.info || {}).videoId}`,
              thumbnail_url: ((track.thumbnails || {}).medium || {}).url
            })
          })
        }
      })
      playlists.forEach((playlist) => {
        playlist.tracks.sort((a, b) => { return a.position - b.position })
        playlist.src = `https://www.youtube.com/embed/?list=${playlist.playlistId}&v=${playlist.tracks[0].videoId}`
      })
    } catch (error) {
      console.error(error)
    }
    console.log(playlists.length)

    return {
      playlists,
      apiUrl
    }
  },
  methods: {
    infiniteHandler() {
      (async () => {
        console.log('start additional loading')
        const res = await axios.get(`${this.apiUrl}/playlists`, {
          params: {
            from: this.playlists.length,
            to: this.playlists.length + 5
          }
        })
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
                  url: `https://www.youtube.com/watch?v=${(track.info || {}).videoId}`,
                  thumbnail_url: ((track.thumbnails || {}).medium || {}).url
                })
              })
            }
          })
          playlists.forEach((playlist) => {
            playlist.tracks.sort((a, b) => { return a.position - b.position })
            playlist.src = `https://www.youtube.com/embed/?list=${playlist.playlistId}&v=${playlist.tracks[0].videoId}`
          })
        } catch (error) {
          console.error(error)
        }

        if (playlists.length > 0) {
          this.playlists = this.playlists.concat(playlists)
          this.$refs.infiniteLoading.stateChanger.loaded()
        } else {
          this.$refs.infiniteLoading.stateChanger.complete()
        }
      })()
    }
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
    height: 56px;
    display: block;
    color: white;
    padding: 4px;
}

.nnn-yt-playlist-item:hover {
    background-color: rgba(0, 0, 0, 0.7);
}

.nnn-yt-playlist-id {
    float: left;
    width: 30px;
    height: 48px;
    line-height: 48px;
    font-family: auto;
    padding-left: 6px;
    font-size: 60%;
    padding-right: 5px;
}
.nnn-yt-playlist-thumbnail {
    width: 64px;
    height: 36px;
    float: left;
    margin: 6px 4px;
    background-size: contain !important;
    background-position: center;
}

.nnn-yt-playlist-title {
    font-family: auto;
    padding-left: 10px;
    font-size: 80%;
    max-height: 2.6em;
    overflow: hidden;
}
.nnn-yt-playlist-channel-title {
    font-family: auto;
    padding-left: 10px;
    font-size: 50%;
    color: #bbb;
    max-height: 1.6em;
    overflow: hidden;
}

</style>
