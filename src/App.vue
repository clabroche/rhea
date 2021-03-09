<template>
  <div id="app">
    <sidebar/>
    <div class="app-content">
        <router-view v-slot="{Component}">
          <transition :name="transitionName">
            <keep-alive max="2">
              <component :is="Component" :key="$router.currentRoute.value.fullPath"/>
            </keep-alive>
          </transition>
        </router-view>
    </div>
    <navbar-bottom/>
    <notification/>
    <div class="version-overlay" v-if="version && version !== currentVersion">
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
import NavbarBottom from './components/NavbarBottom.vue'
import { Plugins } from '@capacitor/core'
const { SplashScreen } = Plugins

export default {
  components: {
    notification: NotificationVue,
    Sidebar,
    NavbarBottom
  },
  computed: {
    androidURL() {
      return `${process.env.VUE_APP_SERVER_URL}:${process.env.VUE_APP_SERVER_PORT}/rhea.apk`
    },
  },
  watch: {
    '$route' (to, from) {
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      if(toDepth === fromDepth) {
        this.transitionName = 'fade'
        return
      }
      this.transitionName = toDepth < fromDepth ? 'fade' : 'fade' 
    }
  },
  data() {
    return {
      transitionName: 'room-right',
      a: 0,
      version: '',
      currentVersion: process.env.VUE_APP_VERSION
    }
  },
  async created() {
    SplashScreen.hide()
    httpError.subscribe(err => {
      if(err.response && err.response.status === 403) {
        notif.next('error', 'Vous n\'êtes pas authentifié.')
        this.$router.push({name: 'login'})
      } 
      console.error(err)
    })
    this.version = await version.get()
  },
  mounted() {
    this.a = 1
  }
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
  overflow: hidden;
}
.app-content {
  height: calc(100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.room-right-enter-active,
.room-right-leave-active,
.room-left-enter-active,
.room-left-leave-active  {
  transition: all 0.5s ease;
  transition-property: transform;
  will-change: transform;
}
.room-right-enter-active,
.room-left-enter-active {
  position: absolute;
  width: 100vw;
}
.room-right-enter-from {transform: translateX(-100%) scale(0.2)}
.room-right-leave-to {transform: translateX(100%) scale(0.2)}
.room-left-enter-from {transform: translateX(100%) scale(0.2)}
.room-left-leave-to {transform: translateX(-100%) scale(0.2)}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-active {
  position: absolute;
  width: 100vw;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>
