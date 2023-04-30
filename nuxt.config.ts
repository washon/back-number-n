// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'back-number-n',
      script: [
        { src: 'https://www.youtube.com/iframe_api' },
        {
          src: 'https://cdnjs.cloudflare.com/ajax/libs/event-source-polyfill/0.0.9/eventsource.js',
        },
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // { name: 'description', content: pkg.description },
        {
          name: 'description',
          content:
            'エオルゼアを代表するライブハウス「Live House N」のバックナンバーを一覧できるサイトです。過去のプレイリストを聞いたり、リクエストされた曲を検索することができます。',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css?family=Montserrat:400,700,800,900',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css?family=M+PLUS+1p',
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      api_url: process.env.BNN_API_URL,
      gtag_id: process.env.GOOGLE_ANALYTICS_TRACKING_ID,
    },
  },

  css: ['/assets/scss/index.scss'],
})
