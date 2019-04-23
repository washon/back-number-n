<template>
  <section class="section">
    <div class="columns is-mobile">
      <!--
      <card
        title="Free"
        icon="github-circle"
      >
        Open source on <a href="https://github.com/buefy/buefy"> GitHub</a>
      </card>

      <card
        title="Responsive"
        icon="cellphone-link"
      >
        <b class="has-text-grey">Every</b> component is responsive
      </card>

      <card
        title="Modern"
        icon="alert-decagram"
      >
        Built with <a href="https://vuejs.org/">Vue.js</a> and <a href="http://bulma.io/">Bulma</a>
      </card>
      -->
      <ul>
        <li v-for="playlist of playlists" :key="playlist.id">
        <h3>
          {{playlist.title}}
        </h3>
        <iframe
          width="640"
          height="610"
          v-bind:src="playlist.src"
          frameborder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
// import Card from '~/components/Card'
import axios from 'axios'

export default {
  name: 'HomePage',
  // components: {
  //   Card
  // },
  async asyncData() {
    const apiUrl = process.env.BNN_API_URL

    const res = await axios.get(`${apiUrl}/playlists`)
    const _data = res.data
    console.log(_data)
    const playlists = _data.map((item) => {
      return {
        src: `https://www.youtube.com/embed/?list=${item.playlistId}`,
        title: item.title
      }
    })
    console.log(playlists)

    return { playlists }
  }
}
</script>
