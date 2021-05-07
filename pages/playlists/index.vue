<template>
  <div>
    <div class="columns is-mobile">
      <div class="column">

        <h3
          class="title is-4 font-montserrat"
          style="margin-top:30px;margin-bottom:10px"
        >
          Playlists
        </h3>
          <div
            v-for="year of monthOrganizedPlaylists"
            :key="year.year"
          >
          <div
            v-for="month of year.monthlist"
            :key="month.publishedAt"
          >
        <h4
          class="title is-4 font-montserrat"
          style="margin-top:30px;margin-bottom:10px"
        >
          {{ year.year}}年 {{ month.month }}月
        </h4>
          <div
            v-for="playlist of month.playlists"
            :key="playlist.playlistId"
          >
            <div
             class="nnn-yt-playlist-items"
            >
              <a
                class="nnn-yt-playlist-item"
                :class="{ is_special: playlist.is_special, is_trend_day: playlist.is_trend_day }"
                :href="playlist.url"
                target="_blank"
              >
                  <div class="nnn-yt-playlist-date">{{ playlist.date }}({{ playlist.dow }})</div>
                <div
                  class="nnn-yt-playlist-thumbnail"
                  :style="{ background: 'url(' + playlist.thumbnail_url + ';)' }"
                />
                <div class="nnn-yt-playlist-title">{{ playlist.title }}</div>

                <span class="nnn-yt-playlist-duration">
                  updated at {{ (new Date(playlist.publishedAt)).toLocaleDateString() }}
                </span>
              </a>
            </div>
            <!--
            <WordCloud :text="playlist.tags" :div-id="'chartdiv-' + playlist.playlistId" />
            <youtube
              :id="'player-' + playlist.playlistId"
              ref="youtube"
              :player-vars="{ list: playlist.playlistId, v: playlist.firstVideoId }"
              class="iframe-youtube"

              @ready="playlistReady"
              @playing="playlistPlaying"
            />
            <div class="nnn-yt-playlist-items">
              <a
                v-for="track of playlist.tracks"
                :key="track.position"
                class="nnn-yt-playlist-item"
                :class="{ playing: track.playing, no_longer: track.no_longer }"
                @click="handerClickVideo(playlist.playlistId, track.videoId)"
              >
                <div class="nnn-yt-playlist-id">{{ track.no_longer ? "-" : track.position - ( track.trackPosGap || 0) }}</div>
                <div
                  class="nnn-yt-playlist-thumbnail"
                  :style="{ background: 'url(' + track.thumbnail_url + ';)' }"
                />
                <div class="nnn-yt-playlist-title">{{ track.title }}</div>
                <div class="nnn-yt-playlist-channel-title">{{ track.channelTitle }}</div>
                <span class="nnn-yt-playlist-duration">
                  {{ track.durationStr }}
                </span>
              </a>
            </div>
            -->
        </div>
        </div>
        </div>
        <infinite-loading
          ref="infiniteLoading"
          spinner="spiral"
          @infinite="infiniteHandler"
        >
          <div slot="no-results" />
        </infinite-loading>
      </div>
    </div>
  </div>
</template>

<script>

import { getPlaylists, getPlaylistsCount } from '~/common/playlistsapi'
import WordCloud from '@/components/wordcloud.vue'

export default {
  name: 'HomePage',
  // components: {
  //   WordCloud
  // },
  data() {
    return {
      search: '',
      searchPlaylists: null,
      searchPlaylistsGetting: false,
      searchPlaylistsReady: false,
      players: {},
      searchQueue: [],
      showString: '',
      queryString: '',
      isStartedDumping: false,
      isAwaiting: false,
      playlistsCount: null
    }
  },
  async asyncData({ req, res }) {
    const apiUrl = process.env.BNN_API_URL
    const playlists = await getPlaylists(apiUrl, { from: 0, to: 30, no_trackinfo: true })
    const locationHostname = req.headers.host

    return {
      playlists,
      apiUrl,
      locationHostname
    }
  },
  computed: {
    monthOrganizedPlaylists() {
      if (!this.playlists) {
        return []
      }
      const tempMap = {}

      const dow = ['日', '月', '火', '水', '木', '金', '土']
      for (let i = 0; i < this.playlists.length; i++) {
        const playlist = this.playlists[i]
        const publishedAt = new Date(playlist.publishedAt)

        const year = publishedAt.getYear() + 1900

        let month = publishedAt.getMonth() + 1
        playlist.date = publishedAt.getDate()

        const mr = playlist.title.match(/^(\d\d)\/(\d\d)/)
        if (mr) {
          console.log(mr)
          month = parseInt(mr[1])
          playlist.date = parseInt(mr[2])
        }
        playlist.dow = dow[new Date(`${year}/${month}/${playlist.date}`).getDay()]

        const is_special = !playlist.title.includes('Live House 「 N 」') || !playlist.title.includes('リクエスト') || playlist.title.includes('"')
        playlist.is_special = is_special
        playlist.is_trend_day = playlist.title.includes('トレンドデー')

        if (!tempMap[year]) {
          tempMap[year] = {}
        }
        if (!tempMap[year][month]) {
          tempMap[year][month] = []
        }
        tempMap[year][month].push(playlist)
      }

      const result = []
      for (const year of Object.keys(tempMap).sort().reverse()) {
        const targetYear = {
          year: year,
          monthlist: []
        }

        for (const month of Object.keys(tempMap[year]).map(d => parseInt(d)).sort((a, b) => b - a)) {
          const targetMonth = {
            month: month,
            playlists: tempMap[year][month].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          }

          targetYear.monthlist.push(targetMonth)
        }
        result.push(targetYear)
      }
      console.log('==========================')
      console.log(tempMap)
      console.log(result)
      return result
    }
  },
  methods: {
    handlerSearchInput(e) {
      if (!this.isStartedDumping) {
        this.isStartedDumping = true
        this.searchPlaylistsGetting = true
        this.searchPlaylistsReady = false
        this.searchPlaylists = []
        this.startDumpSearchPlaylists()
      }
      this.waitAndgo(this.search)
    },
    async startDumpSearchPlaylists() {
      this.playlistsCount = await getPlaylistsCount(this.apiUrl)

      let isFinished = false
      while (!isFinished) {
        const playlists = await getPlaylists(this.apiUrl, {
          from: this.searchPlaylists.length,
          to: this.searchPlaylists.length + 6
        })
        if (playlists.length > 0) {
          this.searchPlaylists = this.searchPlaylists.concat(playlists)
        } else {
          isFinished = true
          this.searchPlaylistsReady = true
          this.searchPlaylistsGetting = false
        }
      }
    },
    waitAndgo(searchQuery) {
      const $scope = this
      $scope.isAwaiting = true
      // 処理待ちのイベントが無いか確認し、ある場合は全て実行をキャンセルする
      if ($scope.searchQueue.length > 0) {
        $scope.searchQueue.forEach(function (elem) {
          clearTimeout(elem)
          $scope.searchQueue.shift()
        })
      }

      // 1秒間request関数の実行を待つ。setTimeOutのIDを取得し、処理待ち用のキューに格納する
      const waitMsec = searchQuery.length < 3 ? 500 : 200
      const eventId = setTimeout(request, waitMsec, searchQuery)
      $scope.searchQueue.push(eventId)

      // サーバーへのリクエスト処理。ここでは便宜的にscopeへ代入します。
      function request(query) {
        // $scope.searchPlaylists = await searchPlaylists($scope.apiUrl, query)
        $scope.queryString = query
        $scope.isAwaiting = false
      }
    },
    hitsAllMultipleConditions(title, conditions) {
      return conditions.every((c) => {
        return (title || '').toLowerCase().includes(c.toLowerCase())
      })
    },
    infiniteHandler() {
      (async () => {
        const playlists = await getPlaylists(this.apiUrl, {
          from: this.playlists.length,
          to: this.playlists.length + 30,
          no_trackinfo: true
        })

        if (playlists.length > 0) {
          this.playlists = this.playlists.concat(playlists)
          // this.$set(this.playlists, this.playlists.concat(playlists))
          this.playlists.splice()
          this.$refs.infiniteLoading.stateChanger.loaded()
        } else {
          this.$refs.infiniteLoading.stateChanger.complete()
        }
      })()
    },
    playlistReady(e) {
      this.players[e.getPlaylistId()] = e
      e.playVideo()
      e.stopVideo()
    },
    playlistPlaying(e) {
      const playlistId = e.getPlaylistId()
      const videoId = e.getVideoData().video_id
      for (let ip = 0; ip < this.playlists.length; ip++) {
        const playlist = this.playlists[ip]
        if (playlist.playlistId === playlistId) {
          const curPlaylist = this.players[playlistId].getPlaylist()
          let no_longer_count = 0
          for (let it = 0; it < playlist.tracks.length; it++) {
            const track = playlist.tracks[it]
            track.playing = track.videoId === videoId
            track.no_longer = !curPlaylist.includes(track.videoId)
            track.trackPosGap = no_longer_count
            if (track.no_longer) {
              no_longer_count += 1
            }
          }
          break
        }
      }
    },
    handerClickVideo(playlistId, videoId) {
      if (playlistId in this.players) {
        for (let ip = 0; ip < this.playlists.length; ip++) {
          const playlist = this.playlists[ip]
          if (playlist.playlistId === playlistId) {
            const curPlaylist = this.players[playlistId].getPlaylist()
            let no_longer_count = 0
            for (let it = 0; it < playlist.tracks.length; it++) {
              const track = playlist.tracks[it]
              if (track.videoId === videoId) {
                this.players[playlistId].playVideoAt(track.position - 1 - no_longer_count)
                break
              }
              track.no_longer = !curPlaylist.includes(track.videoId)
              track.trackPosGap = no_longer_count
              if (track.no_longer) {
                no_longer_count += 1
              }
            }
            break
          }
        }
      }
    }
  }
}
</script>

<style scoped>

.nnn-yt-playlist-t {
    color: #141414;
}

.nnn-yt-playlist-item {
    background-color: rgba(0, 0, 0, 0.89);
    height: 56px;
    display: block;
    color: white;
    position: relative;
    padding: 4px;
}

.nnn-yt-playlist-item.playing {
    background-color: darkred;
}

.nnn-yt-playlist-item.no_longer {
    background-color: #393939 !important;
    color: #656565 !important;
}

.nnn-yt-playlist-item:hover {
    background-color: rgba(0, 0, 0, 0.7);
}

.nnn-yt-playlist-date {
    float: left;
    width: 50px;
    height: 48px;
    line-height: 48px;
    font-family: auto;
    padding-left: 6px;
    font-size: 60%;
    padding-right: 5px;
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
    background-repeat: round !important;
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

.is_special {
  background-color: #372323;
}

.is_trend_day {
  background-color: #113311;
}

</style>
