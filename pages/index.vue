<script setup lang="ts">
import { ref } from 'vue'
import YouTube from 'vue3-youtube'
import InfiniteLoading from 'v3-infinite-loading'
import 'v3-infinite-loading/lib/style.css'
import 'floating-vue/dist/style.css'

import { getPlaylists, getPlaylistsCount } from '~/common/playlistsapi'

const config = useRuntimeConfig()
const apiUrl = config.public.api_url

const playlists = reactive(await getPlaylists(apiUrl, { from: 0, to: 6 }))

const search = ref('')
const searchPlaylists = reactive([])
const searchPlaylistsGetting = ref(false)
const searchPlaylistsReady = ref(false)
const players = reactive({} as { [key: string]: any })
const searchQueue = [] as any[]
const queryString = ref('')
const isStartedDumping = ref(false)
const isAwaiting = ref(false)
const playlistsCount = ref(0)

const isEmpltyHit = computed(() => {
  if (isAwaiting.value) {
    return false
  }
  if (!searchPlaylistsReady.value) {
    return false
  }
  if (!search.value) {
    return false
  }
  return filteredPlaylists.value.length === 0
})

const playlistIdIndexMap = computed(() => {
  const _d: { [key: string]: number } = {}
  for (let _i = 0; _i < playlists.length; _i++) {
    const _pl = playlists[_i]
    _d[_pl.playlistId] = _i
  }
  return _d
})

const filteredPlaylists = computed(() => {
  if (!queryString.value) {
    return []
  }
  if (!searchPlaylists) {
    return []
  }
  const _searchL = queryString.value.toLowerCase().trim().split(' ')
  return searchPlaylists
    .map((playlist) => {
      const _pl = JSON.parse(JSON.stringify(playlist))
      if (hitsAllMultipleConditions(_pl.title, _searchL)) {
        _pl.title = _pl.title.replace(
          new RegExp(_searchL.join('|'), 'ig'),
          '<span class="search-hit">$&</span>'
        )
      } else {
        _pl.tracks = _pl.tracks.filter((track: any) => {
          return (
            hitsAllMultipleConditions(track.title, _searchL) ||
            hitsAllMultipleConditions(track.channelTitle, _searchL)
          )
        })
      }
      _pl.tracks.forEach((track: any) => {
        track.title = (track.title || '').replace(
          new RegExp(_searchL.join('|'), 'ig'),
          '<span class="search-hit">$&</span>'
        )
        track.channelTitle = (track.channelTitle || '').replace(
          new RegExp(_searchL.join('|'), 'ig'),
          '<span class="search-hit">$&</span>'
        )
      })

      return _pl
    })
    .filter((playlist) => {
      return playlist.tracks.length > 0
    })
})

const filterdPlaylistCount = computed(() => {
  let count = 0
  if (filteredPlaylists) {
    filteredPlaylists.value.forEach((playlist) => {
      count += playlist.tracks.length
    })
  }
  return count
})

const handlerSearchInput = () => {
  if (!isStartedDumping.value) {
    isStartedDumping.value = true
    searchPlaylistsGetting.value = true
    searchPlaylistsReady.value = false
    Object.assign(searchPlaylists, [])
    startDumpSearchPlaylists()
  }
  waitAndgo(search.value)
}

const startDumpSearchPlaylists = async () => {
  playlistsCount.value = await getPlaylistsCount(apiUrl)

  let isFinished = false
  while (!isFinished) {
    const _playlists = await getPlaylists(apiUrl, {
      from: searchPlaylists.length,
      to: searchPlaylists.length + 6,
    })
    if (_playlists.length > 0) {
      Object.assign(searchPlaylists, searchPlaylists.concat(_playlists))
    } else {
      isFinished = true
      searchPlaylistsReady.value = true
      searchPlaylistsGetting.value = false
    }
  }
}

const waitAndgo = (searchQuery: string) => {
  isAwaiting.value = true

  // 処理待ちのイベントが無いか確認し、ある場合は全て実行をキャンセルする
  if (searchQueue.length > 0) {
    searchQueue.forEach((elem: any) => {
      clearTimeout(elem)
      searchQueue.shift()
    })
  }

  // 500msec間は実行を待つ。setTimeOutのIDを取得し、処理待ち用のキューに格納する
  const eventId = setTimeout(
    (query) => {
      queryString.value = query
      isAwaiting.value = false
    },
    500,
    searchQuery
  )
  searchQueue.push(eventId)
}

const hitsAllMultipleConditions = (title: string, conditions: any) => {
  return conditions.every((c: any) => {
    return (title || '').toLowerCase().includes(c.toLowerCase())
  })
}

const infiniteHandler = async ($state: any) => {
  try {
    const _playlists = await getPlaylists(apiUrl, {
      from: playlists.length,
      to: playlists.length + 6,
    })

    if (_playlists.length < 6) {
      $state.complete()
    } else {
      for (let i = 0; i < _playlists.length; i++) {
        playlists.push(_playlists[i])
      }
      // $state.loaded()
    }
  } catch (error) {
    $state.error()
  }
}

const playlistReady = (e: any) => {
  const pid = e.target.getPlaylistId() as string
  const _index = playlistIdIndexMap.value[pid]
  const _yt = ytref?.value![_index] as any
  players[pid] = _yt.player

  // これをやると、YouTubeの埋め込みの上部コントローラーが消えるので必要。
  _yt.player.stopVideo()
}

const ytref = ref(null)
const onPlaylistStateChange = (e: any) => {
  const playlistId = e.target.getPlaylistId()
  const videoId = e.target.getVideoData().video_id
  for (let ip = 0; ip < playlists.length; ip++) {
    const playlist = playlists[ip]

    if (playlist.playlistId === playlistId) {
      const curPlaylist = players[playlistId].getPlaylist()
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
}

const handerClickVideo = (playlistId: string, videoId: string) => {
  for (let ip = 0; ip < playlists.length; ip++) {
    const playlist = playlists[ip]
    if (playlist.playlistId === playlistId) {
      const curPlaylist = players[playlistId].getPlaylist()
      let no_longer_count = 0
      for (let it = 0; it < playlist.tracks.length; it++) {
        const track = playlist.tracks[it]
        if (track.videoId === videoId) {
          players[playlistId].playVideoAt(track.position - 1 - no_longer_count)
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
</script>
<template>
  <div>
    <div class="columns is-mobile">
      <div class="column">
        <div style="margin: 20px 0">
          <input
            v-model="search"
            class="input"
            type="text"
            icon="magnify"
            placeholder="(プレイリスト名、動画タイトル、チャンネル名) によるキーワード検索"
            :loading="searchPlaylistsGetting"
            style="margin: 10px 0"
            @input="handlerSearchInput"
          />
          <article v-if="isEmpltyHit" class="message">
            <div class="message-body">
              「{{ search }}」はヒットしませんでした
            </div>
          </article>

          <article v-if="searchPlaylistsGetting" class="message">
            <div class="message-body">
              検索データ構築中... ({{ searchPlaylists.length }}/{{
                playlistsCount
              }})

              <progress
                class="progress"
                :value="searchPlaylists.length"
                :max="playlistsCount"
              />
            </div>
          </article>
          <h3
            v-if="searchPlaylistsReady && search !== '' && !isEmpltyHit"
            class="title is-4"
            style="margin: 10px 0"
          >
            「{{ search }}」の検索結果 : {{ filterdPlaylistCount }}件
          </h3>
          <div id="search-results">
            <div
              v-for="playlist of filteredPlaylists"
              :key="playlist.playlistId"
            >
              <div style="float: right">
                <span class="tag is-dark">
                  {{ new Date(playlist.publishedAt).toLocaleDateString() }} |
                  {{ playlist.totalDurationStr }}
                </span>
              </div>
              <a class="nnn-yt-playlist-t" :href="playlist.url" target="_blank">
                <h3 v-html="playlist.title" />
              </a>
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
                  <div
                    class="nnn-yt-playlist-channel-title"
                    v-html="track.channelTitle"
                  />
                  <span class="nnn-yt-playlist-duration">
                    {{ track.durationStr }}
                  </span>
                </a>
              </div>
            </div>
            <!-- grid-container -->
          </div>
        </div>

        <h3
          class="title is-4 font-montserrat"
          style="margin-top: 30px; margin-bottom: 10px"
        >
          back number
        </h3>

        <!-- 1つ目の要素が出てこないので、一旦ここにおいておく。無駄なので消したい。-->
        <YouTube
          src="https://www.youtube.com/embed/null"
          width="100%"
          height="300px"
          style="display: none"
        />

        <div class="columns is-multiline">
          <div
            v-for="playlist of playlists"
            :key="playlist.playlistId"
            class="column is-vertical is-half-tablet is-one-third-desktop"
          >
            <h3>
              <a class="nnn-yt-playlist-t" :href="playlist.url" target="_blank">
                {{ playlist.title }}
              </a>
              <div style="float: right">
                <span class="tag is-dark">
                  {{ new Date(playlist.publishedAt).toLocaleDateString() }} |
                  {{ playlist.totalDurationStr }}
                </span>
              </div>
            </h3>
            <WordCloud
              :text="playlist.tags"
              :div-id="'chartdiv-' + playlist.playlistId"
            />
            <div style="width: 100%; height: 300px; background: black">
              <YouTube
                :id="'player-' + playlist.playlistId"
                ref="ytref"
                :src="`${playlist.firstVideoId}`"
                :vars="{
                  list: playlist.playlistId,
                }"
                width="100%"
                style="background: black"
                height="300px"
                @ready="playlistReady"
                @state-change="onPlaylistStateChange"
              />
            </div>

            <div class="nnn-yt-playlist-items">
              <a
                v-for="track of playlist.tracks"
                :key="track.position"
                class="nnn-yt-playlist-item"
                :class="{ playing: track.playing, no_longer: track.no_longer }"
                @click="handerClickVideo(playlist.playlistId, track.videoId)"
              >
                <div class="nnn-yt-playlist-id">
                  {{
                    track.no_longer
                      ? '-'
                      : track.position - (track.trackPosGap || 0)
                  }}
                </div>
                <div
                  class="nnn-yt-playlist-thumbnail"
                  :style="{ background: 'url(' + track.thumbnail_url + ';)' }"
                />
                <div class="nnn-yt-playlist-title">{{ track.title }}</div>
                <div class="nnn-yt-playlist-channel-title">
                  {{ track.channelTitle }}
                </div>
                <span class="nnn-yt-playlist-duration">
                  {{ track.durationStr }}
                </span>
              </a>
            </div>
          </div>
          <!-- grid-container -->
        </div>
        <div id="loadingfooter" style="position: relative; left: 50%">
          <InfiniteLoading @infinite="infiniteHandler"> </InfiniteLoading>
        </div>
      </div>
    </div>
  </div>
</template>

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
</style>
