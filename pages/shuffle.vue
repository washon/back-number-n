<script setup lang="ts">
import { ref } from 'vue'
import YouTube from 'vue3-youtube'
import InfiniteLoading from 'v3-infinite-loading'
import 'v3-infinite-loading/lib/style.css'
import 'floating-vue/dist/style.css'

import { getShuffled } from '~/common/playlistsapi'

const config = useRuntimeConfig()
const apiUrl = config.public.api_url

const playlists = reactive(await getShuffled(apiUrl))

const players = reactive({} as { [key: string]: any })

useHead({
  bodyAttrs: {
    class: 'body-shuffle',
  },
})
const playlistIdIndexMap = computed(() => {
  const _d: { [key: string]: number } = {}
  for (let _i = 0; _i < playlists.length; _i++) {
    const _pl = playlists[_i]
    _d[_pl.playlistId] = _i
  }
  return _d
})

const infiniteHandler = async ($state: any) => {
  try {
    const _playlists = await getShuffled(apiUrl)

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

const ytref = ref(null)
const playlistReady = (e: any) => {
  const pid = e.target.getPlaylistId() as string
  const _index = playlistIdIndexMap.value[pid]
  const _yt = ytref?.value![_index] as any
  players[pid] = _yt.player

  // これをやると、YouTubeの埋め込みの上部コントローラーが消えるので必要。
  // _yt.player.stopVideo()
}
</script>
<template>
  <div>
    <div class="columns is-mobile">
      <div class="column">
        <h3
          class="title is-4 font-montserrat"
          style="margin-top: 30px; margin-bottom: 10px; color: white"
        >
          Shuffle
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
            <div
              style="
                width: 100%;
                height: 300px;
                background: black;
                border-radius: 8px;
                overflow: hidden;
              "
            >
              <YouTube
                :id="'player-' + playlist.playlistId"
                ref="ytref"
                :src="`${playlist.firstVideoId}`"
                :vars="{
                  list: playlist.playlistId,
                  controls: 0,
                }"
                width="100%"
                style="background: black"
                height="300px"
                @ready="playlistReady"
              />
            </div>
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
  color: white;
}
</style>
