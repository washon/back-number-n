<template>
  <div>
    <div class="columns is-mobile">
      <div class="column">
        <div style="margin: 20px 0">
          <b-input
            v-model="search"
            @input="handlerSearchInput"
            icon="magnify"
            placeholder="キーワード検索 ( 動画のタイトル、チャンネル名、プレイリスト名 )"
            :loading="searchPlaylistsGetting"
            style="margin: 10px 0"
          />
          <b-notification
            :closable="false"
            v-if="isEmpltyHit"
            >
              「{{ search }}」はヒットしませんでした
          </b-notification>
          <h3
            class="title is-4"
            style="margin: 10px 0"
            v-if="searchPlaylistsReady && search !== '' && !isEmpltyHit"
            >
            「{{ search }}」の検索結果 : {{ filterdPlaylistCount }}件
            </h3>
          <div id="search-results">
            <div v-for="playlist of filteredPlaylists" :key="playlist.playlistId">
              <b-tooltip type="is-dark" label="playlist作成日 | total再生時間" style="float:right;">
                <span class="tag is-dark">
                  {{ (new Date(playlist.publishedAt)).toLocaleDateString() }} | {{ playlist.totalDurationStr }}
                </span>
              </b-tooltip>
              <h3 v-html="playlist.title" />
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
                  <div class="nnn-yt-playlist-title" v-html="track.title" />
                  <div class="nnn-yt-playlist-channel-title" v-html="track.channelTitle" />
                  <span
                    class="nnn-yt-playlist-duration">
                    {{ track.durationStr }}
                  </span>
                </a>
              </div>
            </div> <!-- grid-container -->
          </div>
        </div>

        <h3
          class="title is-4 font-montserrat"
          style="margin-top:30px;margin-bottom:10px"
        >
        back number
        </h3>
        <div class="columns is-multiline">

          <div class="column is-vertical is-half-tablet is-one-third-desktop" v-for="playlist of playlists" :key="playlist.playlistId">
            <h3>
              {{ playlist.title }}
              <b-tooltip type="is-dark" label="playlist作成日 | total再生時間" style="float:right;">
                <span class="tag is-dark">
                  {{ (new Date(playlist.publishedAt)).toLocaleDateString() }} | {{ playlist.totalDurationStr }}
                </span>
              </b-tooltip>
            </h3>
            <youtube
              ref="youtube"
              class="iframe-youtube"
              :id="'player-' + playlist.playlistId"
              :player-vars="{ list: playlist.playlistId, v:playlist.firstVideoId }"
              @ready="playlistReady"
              @playing="playlistPlaying"
            />
            <div class="nnn-yt-playlist-items">
              <a
                v-for="track of playlist.tracks"
                :key="track.position"
                class="nnn-yt-playlist-item"
                :class="{ playing: track.playing }"
                @click="handerClickVideo(playlist.playlistId, track.position)"
              >
                <div class="nnn-yt-playlist-id">{{ track.position }}</div>
                <div
                  class="nnn-yt-playlist-thumbnail"
                  :style="{ background: 'url(' + track.thumbnail_url + ';)' }"
                />
                <div class="nnn-yt-playlist-title">{{ track.title }}</div>
                <div class="nnn-yt-playlist-channel-title">{{ track.channelTitle }}
                </div>
                <span
                  class="nnn-yt-playlist-duration">
                  {{ track.durationStr }}
                </span>
              </a>
            </div>
          </div> <!-- grid-container -->
        </div>
        <infinite-loading
          ref="infiniteLoading"
          spinner="spiral"
          @infinite="infiniteHandler">
          <div slot="no-results"/>
        </infinite-loading>
      </div>
    </div>
  </div>
</template>

<script>
import { getPlaylists } from '~/common/playlistsapi'
import axios from 'axios'

export default {
  name: 'HomePage',
  data() {
    return {
      search: '',
      searchPlaylists: null,
      searchPlaylistsGetting: false,
      searchPlaylistsReady: false,
      players: {}
    }
  },
  computed: {
    isEmpltyHit() {
      if (!this.searchPlaylistsReady) {
        return false
      }
      if (!this.search) {
        return false
      }
      return this.filteredPlaylists.length === 0
    },
    filteredPlaylists() {
      if (!this.search) {
        return []
      }
      if (!this.searchPlaylists) {
        return []
      }
      const _searchL = this.search.toLowerCase()
      return this.searchPlaylists.map((playlist) => {
        const _pl = JSON.parse(JSON.stringify(playlist))
        if ((_pl.title || '').toLowerCase().includes(_searchL)) {
          _pl.title = _pl.title.replace(new RegExp(_searchL, 'i'), '<span class="search-hit">$&</span>')
        } else {
          _pl.tracks = _pl.tracks.filter((track) => {
            return (track.title || '').toLowerCase().includes(_searchL) ||
            (track.channelTitle || '').toLowerCase().includes(_searchL)
          })
        }
        _pl.tracks.forEach((track) => {
          if (track.title) {
            track.title = track.title.replace(new RegExp(_searchL, 'i'), '<span class="search-hit">$&</span>')
          }
          if (track.channelTitle) {
            track.channelTitle = track.channelTitle.replace(new RegExp(_searchL, 'i'), '<span class="search-hit">$&</span>')
          }
        })

        return _pl
      }).filter((playlist) => {
        return playlist.tracks.length > 0
      })
    },
    filterdPlaylistCount() {
      let count = 0
      if (this.filteredPlaylists) {
        this.filteredPlaylists.forEach((playlist) => {
          count += playlist.tracks.length
        })
      }
      return count
    }
  },
  async asyncData() {
    const apiUrl = process.env.BNN_API_URL
    const playlists = await getPlaylists(apiUrl, { from: 0, to: 6 })

    return {
      playlists,
      apiUrl
    }
  },
  methods: {
    async handlerSearchInput(e) {
      if (!this.searchPlaylistsReady) {
        this.searchPlaylistsGetting = true
        this.searchPlaylists = await getPlaylists(this.apiUrl)
        this.searchPlaylistsReady = true
        this.searchPlaylistsGetting = false
      }
    },
    infiniteHandler() {
      (async () => {
        console.log('start additional loading')
        const playlists = await getPlaylists(this.apiUrl, {
          from: this.playlists.length,
          to: this.playlists.length + 6
        })

        if (playlists.length > 0) {
          this.playlists = this.playlists.concat(playlists)
          this.$refs.infiniteLoading.stateChanger.loaded()
        } else {
          this.$refs.infiniteLoading.stateChanger.complete()
        }
      })()
    },
    playlistReady(e) {
      this.players[e.getPlaylistId()] = e
      console.log(e)
      console.log(e.getVideoData())
      console.log(this.playlists)
    },
    playlistPlaying(e) {
      const playlistId = e.getPlaylistId()
      const videoId = e.getVideoData().video_id
      for (let ip = 0; ip < this.playlists.length; ip++) {
        const playlist = this.playlists[ip]
        if (playlist.playlistId === playlistId) {
          for (let it = 0; it < playlist.tracks.length; it++) {
            const track = playlist.tracks[it]
            track.playing = track.videoId === videoId
          }
          break
        }
      }
    },
    handerClickVideo(playlistId, trackPos) {
      if (playlistId in this.players) {
        this.players[playlistId].playVideoAt(trackPos - 1)
      }
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
    position: relative;
}

.nnn-yt-playlist-item.playing {
    background-color: darkred;
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

.nnn-yt-playlist-duration {
    font-size: 50%;
    color: #444;
    position: absolute;
    right: 8px;
    bottom: 4px;
}

.playing > .nnn-yt-playlist-duration {
    color: #bbb;
}

.nnn-yt-playlist-item:hover > .nnn-yt-playlist-duration {
    color: #bbb;
}

.section {
  padding: 0px !important;
}

#search-results >>> .search-hit {
  background-color: orangered;
  color: white;
}

</style>
