<script setup lang="ts">
import InfiniteLoading from 'v3-infinite-loading'
import 'v3-infinite-loading/lib/style.css'

import { getPlaylists } from '~/common/playlistsapi'

const config = useRuntimeConfig()
const apiUrl = config.public.api_url
const playlists = reactive(
  await getPlaylists(apiUrl, { from: 0, to: 30, no_trackinfo: true })
)

const monthOrganizedPlaylists = computed(() => {
  if (!playlists) {
    return []
  }
  const tempMap = {} as { [key: string]: any }

  const dow = ['日', '月', '火', '水', '木', '金', '土']
  for (let i = 0; i < playlists.length; i++) {
    const playlist = playlists[i]
    const publishedAt = new Date(playlist.publishedAt)

    const year = publishedAt.getFullYear().toString()

    let month = publishedAt.getMonth() + 1
    playlist.date = publishedAt.getDate()

    const mr = playlist.title.match(/^(\d\d)\/(\d\d)/)
    if (mr) {
      month = parseInt(mr[1])
      playlist.date = parseInt(mr[2])
    }
    playlist.dow = dow[new Date(`${year}/${month}/${playlist.date}`).getDay()]

    const is_special =
      !playlist.title.includes('Live House 「 N 」') ||
      !playlist.title.includes('リクエスト') ||
      playlist.title.includes('"')
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
      year,
      monthlist: [] as any[],
    }

    for (const month of Object.keys(tempMap[year])
      .map((d) => parseInt(d))
      .sort((a, b) => b - a)) {
      const targetMonth = {
        month,
        playlists: tempMap[year][month].sort(
          (a: any, b: any) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        ),
      }

      targetYear.monthlist.push(targetMonth)
    }
    result.push(targetYear)
  }
  return result
})

const infiniteHandler = async ($state: any) => {
  try {
    const _playlists = await getPlaylists(apiUrl, {
      from: playlists.length,
      to: playlists.length + 30,
      no_trackinfo: true,
    })

    if (_playlists.length < 30) {
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
</script>
<template>
  <div>
    <div class="columns is-mobile">
      <div class="column">
        <h3
          class="title is-4 font-montserrat"
          style="margin-top: 30px; margin-bottom: 10px"
        >
          Playlists
        </h3>
        <div v-for="year of monthOrganizedPlaylists" :key="year.year">
          <div v-for="month of year.monthlist" :key="month.publishedAt">
            <h4
              class="title is-4 font-montserrat"
              style="margin-top: 30px; margin-bottom: 10px"
            >
              {{ year.year }}年 {{ month.month }}月
            </h4>
            <div v-for="playlist of month.playlists" :key="playlist.playlistId">
              <div class="nnn-yt-playlist-items">
                <a
                  class="nnn-yt-playlist-item"
                  :class="{
                    is_special: playlist.is_special,
                    is_trend_day: playlist.is_trend_day,
                  }"
                  :href="playlist.url"
                  target="_blank"
                >
                  <div class="nnn-yt-playlist-date">
                    {{ playlist.date }}({{ playlist.dow }})
                  </div>
                  <div
                    class="nnn-yt-playlist-thumbnail"
                    :style="{
                      background: 'url(' + playlist.thumbnail_url + ';)',
                    }"
                  />
                  <div class="nnn-yt-playlist-title">{{ playlist.title }}</div>

                  <span class="nnn-yt-playlist-duration">
                    updated at
                    {{ new Date(playlist.publishedAt).toLocaleDateString() }}
                  </span>
                </a>
              </div>
            </div>
          </div>
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
