import VueGtag from 'vue-gtag'

// Nuxtプラグインの登録
export default defineNuxtPlugin((nuxtApp) => {
  // ルーター取得
  const router = useRouter()
  const config = useRuntimeConfig()

  // Vue登録
  nuxtApp.vueApp.use(
    VueGtag,
    {
      appName: 'back-number-N-reborn', // サイトの名称
      pageTrackerScreenviewEnabled: true, // ページトラッキングスクリーンビューを有効
      config: { id: config.public.gtag_id }, // GoogleAnalytics(GA4)の測定IDを指定する
    },
    router
  )
})
