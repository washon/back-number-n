<script setup lang="ts">
import * as am5 from '@amcharts/amcharts5'
import * as am5wc from '@amcharts/amcharts5/wc'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'

interface Props {
  divId: string
  text: string[]
}

const props = defineProps<Props>()

onMounted(() => {
  const root = am5.Root.new(props.divId)

  root.setThemes([am5themes_Animated.new(root)])

  const series = root.container.children.push(
    am5wc.WordCloud.new(root, {
      colors: am5.ColorSet.new(root, {
        colors: [
          am5.color(0x4ecdc4), //
          am5.color(0xd14081), //
          am5.color(0xf3c98b),
          am5.color(0xf2d0a4),
          am5.color(0xc3bef7),
        ],
      }),

      step: 5,

      maxCount: 40,
      minWordLength: 2,

      minFontSize: am5.percent(4),
      maxFontSize: am5.percent(10),
      randomness: 0,
      categoryField: 'tag',
      valueField: 'weight',
    })
  )

  const EXCLUDE_WORDS = [
    'all',
    'at',
    'album',
    'and',
    'audio',
    'by',
    'download',
    'ダウンロード',
    'feat',
    'ft',
    'from',
    'for',
    'full',
    'フル',
    'full album',
    'フルアルバム',
    'go',
    'in',
    'it',
    'is',
    'japan',
    'live',
    'ライブ',
    'lyric video',
    'lyric',
    'lyrics',
    '歌詞',
    'me',
    'music',
    '音楽',
    'ミュージック',
    'mv',
    'ミュージックビデオ',
    'music video',
    'my',
    'no',
    'of',
    'official music video',
    'official video',
    'official',
    'オフィシャル',
    'on',
    'pv',
    'records',
    'song',
    'the',
    'to',
    'tv',
    'ver',
    'version',
    'video',
    'ビデオ',
    'you',
    'youtube',
    'with',
    'an',
    'http',
    'https',
    'new',
    'twitter',
    'undefined',
    'unreachable',
    '高画質',
    '高音質',
    'hd',
    'hq',
    'ようつべ',
    'vevo',
    '(',
    ')',
  ]

  series.labels.template.setAll({
    fontFamily: 'Montserrat',
    fontWeight: '800',
  })

  const calc = {} as { [key: string]: number }
  props.text!.forEach((tag: string) => {
    if (!tag || tag.length < 2 || tag.length > 20) {
      return
    }
    if (EXCLUDE_WORDS.includes(tag.toLowerCase())) {
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

  const _d = []
  for (const k in calc) {
    _d.push({ tag: k, weight: calc[k] })
  }
  const _data = _d
    .sort((a, b) => {
      return b.weight - a.weight
    })
    .slice(0, 40)

  for (let i = 0; i < Math.min(1, _data.length); i++) {
    _data[i].weight += 1
  }

  series.data.setAll(_data)
})
</script>

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
