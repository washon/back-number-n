<template>
  <div>
    <nav
      class="navbar header has-shadow"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand">
        <a
          class="navbar-item title-logo"
          href="/"
        >
          back number N
        </a>

      </div>
    </nav>

    <section class="main-content">
      <div class="container" >
        <nuxt />
      </div>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          title: 'Home',
          icon: 'home',
          to: { name: 'index' }
        },
        {
          title: 'Inspire',
          icon: 'lightbulb',
          to: { name: 'inspire' }
        }
      ]
    }
  }
}
</script>

<style scoped>

@media screen and (min-width: 1650px) {
  .container {
    max-width: 1540px;
    width: 1540px;
  }
}
@media screen and (min-width: 1730px) {
  .container {
    max-width: 1680px;
    width: 1680px;
  }
}
@media screen and (min-width: 1830px) {
  .container {
    max-width: 1780px;
    width: 1780px;
  }
}
@media screen and (min-width: 1920px) {
  .container {
    max-width: 1870px;
    width: 1870px;
  }
}
</style>
