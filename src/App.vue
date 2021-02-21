<template>
  <div id="app">
    <sidebar/>
    <navbar/>
    <div class="app-content">
      <router-view/>
    </div>
    <notification></notification>
    <div class="version-overlay" v-if="true">
      <h2>Halte !</h2>
      Une nouvelle version est disponible au téléchargement 
      <a :href="androidURL">
        <div class="download-line">
          <i class="fab fa-android" aria-hidden="true"></i>
          Télecharger la version android
        </div>
      </a>
    </div>
  </div>
</template>

<script>
import httpError from './services/HTTPError'
import NotificationVue from './components/Notification.vue'
import notif from './services/notification'
import version from './services/version'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
export default {
  components: {
    notification: NotificationVue,
    Sidebar,
    Navbar
  },
  computed: {
    androidURL() {
      return `${process.env.VUE_APP_SERVER_URL}:${process.env.VUE_APP_SERVER_PORT}/rhea.apk`
    },
  },
  data() {
    return {
      version: '',
      currentVersion: process.env.VUE_APP_VERSION
    }
  },
  async created() {
    this.$root.scroll = {}
    httpError.subscribe(err => {
      if(err.response && err.response.status === 403) {
        notif.next('error', 'Vous n\'êtes pas authentifié.')
        this.$router.push({name: 'login'})
      } 
      console.error(err)
    })
    this.version = await version.get()
  },
}
</script>
<style lang="scss">
@import './assets/theme/index';
</style>
<style lang="scss" scoped>
.version-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  z-index: 1300;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  text-align: center;
  .download-line {
    background-color: var(--headerBgColor);
    color: var(--headerTextColor);
    padding: 0 5px;
    border-radius: 4px;
    margin: 20px 0
  }
}
input, textarea {
  font-family: Jost, Helvetica, Arial, sans-serif;
}
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.app-content {
  height: calc(100%);
  overflow: auto;
}

</style>
