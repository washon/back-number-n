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

    <section class="main-content columns">
      <div class="container column is-10">
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
</style>
