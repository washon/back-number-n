<template>
  <div :id="divId" class="chartdiv" />
</template>

<style lang="css" scoped>
.chartdiv {
  width: 100%;
  height: 300px;
  background: rgba(0, 0, 0, 0.89);
  overflow: hidden;
}
</style>

<script>
import * as am4core from '@amcharts/amcharts4/core'
import am4themes_animated from '@amcharts/amcharts4/themes/animated'
import * as am4plugins_wordCloud from '@amcharts/amcharts4/plugins/wordCloud'

export default {
  props: {
    divId: {
      type: String,
      default: 'chartdiv',
      required: true
    },
    text: {
      type: Array,
      default: () => [''],
      required: true
    }
  },
  mounted() {
    // Themes begin
    am4core.useTheme(am4themes_animated)
    // Themes end

    const chart = am4core.create(this.divId, am4plugins_wordCloud.WordCloud)
    const series = chart.series.push(new am4plugins_wordCloud.WordCloudSeries())

    series.accuracy = 4
    series.step = 5
    series.rotationThreshold = 0.7
    series.maxCount = 40
    series.minWordLength = 2
    // series.labels.template.tooltipText = '{word}: {value}'
    series.fontFamily = 'Montserrat'
    series.fontWeight = 800
    series.minFontSize = am4core.percent(4)
    series.maxFontSize = am4core.percent(10)
    series.excludeWords = [
      'ALL', 'All', 'all',
      'AT', 'At', 'at',
      'ALBUM', 'Album', 'album',
      'AND', 'And', 'and',
      'AUDIO', 'Audio', 'audio',
      'BY', 'By', 'by',
      'DOWNLOAD', 'Download', 'download', 'ダウンロード',
      'FEAT', 'Feat', 'feat', 'ft', 'Ft', 'FT',
      'FROM', 'From', 'from',
      'FOR', 'For', 'for',
      'FULL', 'Full', 'full', 'フル',
      'FULL ALBUM', 'Full Album', 'full album', 'フルアルバム',
      'GO', 'Go', 'go',
      'IN', 'In', 'in',
      'IT', 'It', 'it',
      'IS', 'Is', 'is',
      'JAPAN', 'Japan', 'japan',
      'LIVE', 'Live', 'live', 'ライブ',
      'LYRIC VIDEO', 'Lyric Video', 'lyric video',
      'LYRICS', 'Lyrics', 'lyrics', '歌詞',
      'ME', 'Me', 'me',
      'MUSIC', 'Music', 'music', '音楽', 'ミュージック',
      'MV', 'mv', 'ミュージックビデオ', 'MUSIC VIDEO', 'Music Video', 'music video',
      'MY', 'My', 'my',
      'NO', 'No', 'no',
      'OF', 'Of', 'of',
      'OFFICIAL MUSIC VIDEO', 'Official Music Video', 'official music video',
      'OFFICIAL VIDEO', 'Official Video', 'official video',
      'OFFICIAL', 'Official', 'official', 'オフィシャル',
      'ON', 'On', 'on',
      'PV', 'Pv', 'pv',
      'RECORDS', 'Records', 'records',
      'SONG', 'Song', 'song',
      'THE', 'The', 'the',
      'TO', 'To', 'to',
      'TV', 'Tv', 'tv',
      'VER', 'Ver', 'ver',
      'VERSION', 'Version', 'version',
      'VIDEO', 'Video', 'video', 'ビデオ',
      'YOU', 'You', 'you',
      'YOUTUBE', 'YouTube', 'youtube',
      'WITH', 'With', 'with',
      'an',
      'http', 'https',
      'new',
      'twitter',
      'undefined', 'unreachable',
      '高画質', '高音質',
      'HD', 'Hd', 'hd',
      'HQ', 'Hq', 'hq',
      'ようつべ', 'vevo',
      '(', ')'
    ]

    series.randomness = 0.4
    // series.text = this.text
    const calc = {}
    this.text.forEach((tag) => {
      if (!tag || tag.length < series.minWordLength || tag.length > 20) {
        return
      }
      if (series.excludeWords.includes(tag)) {
        return
      }
      if (!(tag in calc)) {
        calc[tag] = 0
      }
      if (/^[a-zA-Z0-9]+$/.test(tag)) {
        calc[tag] += 1
      } else {
        calc[tag] += 1.2
      }
    })
    series.data = []
    for (const k in calc) {
      series.data.push({ tag: k, weight: calc[k] })
    }
    series.data = series.data.sort((a, b) => { return b.weight - a.weight }).slice(0, series.maxCount)

    // console.log(series.data)
    series.dataFields.word = 'tag'
    series.dataFields.value = 'weight'

    // // progress
    // series.events.on('arrangestarted', function (ev) {
    //   ev.target.baseSprite.preloader.show(0)
    // })

    // series.events.on('arrangeprogress', function (ev) {
    //   ev.target.baseSprite.preloader.progress = ev.progress
    // })

    // カラフルになる。
    series.colors = new am4core.ColorSet()
    series.colors.passOptions = {} // makes it loop
  }
}
</script>
