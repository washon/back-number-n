<template>
  <div>
    <nav
      class="navbar header has-shadow"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand">
        <div class="navbar-item">
          <nuxt-link to="/" class="navbar-item title-logo">
            back number N
          </nuxt-link>
        </div>
      </div>

      <div id="navbarBasic" class="is-active" style="display: flex">
        <div class="navbar-start is-active"></div>
        <div class="navbar-end is-active" style="display: flex">
          <div class="navbar-item">
            <a
              class="navbar-item title-logo link-to-n"
              style="font-size: smaller; font-weight: 800; bottom: -5px"
              href="https://livehousen.wixsite.com/ff14n"
              target="_blank"
            >
              Live House N
            </a>
          </div>
          <div class="navbar-item">
            <nuxt-link
              to="/playlists"
              class="navbar-item title-logo"
              style="
                font-size: smaller;
                font-weight: 800;
                height: 100%;
                bottom: -5px;
              "
            >
              Playlists
            </nuxt-link>
          </div>
        </div>
      </div>
    </nav>
    <section class="main-content">
      <div class="container">
        <slot />
      </div>
    </section>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      items: [
        {
          title: 'Home',
          icon: 'home',
          to: { name: 'index' },
        },
        {
          title: 'Inspire',
          icon: 'lightbulb',
          to: { name: 'inspire' },
        },
      ],
    }
  },
}
</script>

<style scoped>
@media screen and (min-width: 1650px) {
  .container {
    max-width: 1540px !important;
    width: 1540px;
  }
}
@media screen and (min-width: 1730px) {
  .container {
    max-width: 1680px !important;
    width: 1680px;
  }
}
@media screen and (min-width: 1830px) {
  .container {
    max-width: 1780px !important;
    width: 1780px;
  }
}
@media screen and (min-width: 1920px) {
  .container {
    max-width: 1870px !important;
    width: 1870px;
  }
}
</style>
