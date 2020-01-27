module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  // add your custom rules here
  rules: {
    "no-console": "warn",
    "no-unused-vars": "warn",
    "vue/no-v-html": "off",
    "camelcase": "off",
    "no-extend-native": "off"
  }
}
