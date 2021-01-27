<template>
  <div id="app">
    <div class="overlay" :class="{open: sidebar.open}" @click="sidebar.open = false"></div>
    <div class="sidebar" :class="{open: sidebar.open}">
      <ul>
        <li @click="$router.push({name: 'dashboard'}); sidebar.open = false">
          <i class="fas fa-home" aria-hidden="true"></i>
          Accueil
        </li>
        <li @click="$router.push({name: 'lists'}); sidebar.open = false">
          <i class="fas fa-list" aria-hidden="true"></i>
          Listes
        </li>
        <li @click="$router.push({name: 'items'}); sidebar.open = false">
          <i class="fas fa-cookie" aria-hidden="true"></i>
          Produits
        </li>
        <li @click="$router.push({name: 'categories'}); sidebar.open = false">
          <i class="fas fa-th" aria-hidden="true"></i>
          Categories
        </li>
        <li @click="$router.push({name: 'inventory'}); sidebar.open = false">
          <i class="fas fa-database" aria-hidden="true"></i>
          Inventaire
        </li>
        <li @click="$router.push({name: 'recipes'}); sidebar.open = false">
          <i class="fas fa-clipboard-list" aria-hidden="true"></i>
          Recettes
        </li>
        <li @click="$router.push({name: 'calendar'}); sidebar.open = false">
          <i class="fas fa-calendar-alt" aria-hidden="true"></i>
          Calendrier
        </li>
      </ul>
      <ul>
        <a :href="androidURL">
          <li>
            <i class="fab fa-android" aria-hidden="true"></i>
            Télécharger
          </li>
        </a>
        <li @click="disconnect">
          <i class="fas fa-plug" aria-hidden="true"></i>
          Déconnection
        </li>
      </ul>
    </div>
    <div id="nav" v-if="$route.name !== 'login'">
      <div class="trigger" v-if="Auth.user" @click="sidebar.open = true"><i class="fas fa-list" aria-hidden="true"></i></div>
      <div class="navbar-title">
        {{Header.title}}
        <div v-if="Header.subtitle" class="navbar-subtitle">
          {{Header.subtitle}}
        </div>
      </div>
    </div>
    <div class="app-content">
      <router-view/>
    </div>
    <notification></notification>
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
import Header from './services/Header'
import sidebar from './services/sidebar'
import Auth from './services/Auth'
import httpError from './services/HTTPError'
import NotificationVue from './components/Notification'
import notif from './services/notification'
import version from './services/version'
export default {
  components: {
    notification: NotificationVue
  },
  data() {
    return {
      Header,
      sidebar,
      Auth,
      version: '',
      currentVersion: process.env.VUE_APP_VERSION
    }
  },
  computed: {
    androidURL() {
      return `${process.env.VUE_APP_SERVER_URL}:${process.env.VUE_APP_SERVER_PORT}/rhea.apk`
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
  methods: {
    disconnect() {
      Auth.disconnect()
      sidebar.open = false
      this.$router.push({name: 'login'})
    }
  }
}
</script>
<style lang="scss">
@import '~@fortawesome/fontawesome-free/css/all.min.css';
.v--modal-overlay .v--modal-box {
  overflow: visible !important;
}
:root {
  --fontSize: 1em;
  --borderRadius: 0px;
  --headerBorderWidth: 0px;
  --headerBorderColor: transparent;
  --headerBgColor: #466c80;
  --headerBgColorAccent: #2f5466;
  --headerTextColor: white;
  --headerTextColorAccent: white;
  --headerFontWeight: bold;
  --headerIconTextColor: #ffffff;
  --contentBorderWidth: 1px;
  --contentBorderColor: #dddddd;
  --contentBgColor: #ffffff;
  --contentTextColor: #362b36;
  --stateDefaultBorderWidth: 0px;
  --stateDefaultBorderColor: transparent;
  --stateDefaultBgColor: #466c80;
  --stateDefaultTextColor: #ffffff;
  --stateActiveBorderColor: transparent;
  --stateActiveBgColor: #7CB342;
  --stateActiveTextColor: #ffffff;
  --stateHighlightBorderColor: transparent;
  --stateHighlightBgColor: #7CB342;
  --stateHighlightTextColor: #ffffff;
  --stateFocusBorderColor: transparent;
  --stateFocusBgColor: #e4f1fb;
  --stateFocusTextColor: #0070a3;
  --stateErrorBorderColor: transparent;
  --stateErrorBgColor: #cd0a0a;
  --stateErrorTextColor: #ffffff;
  --stateHoverBorderColor: transparent;
  --stateHoverBgColor: #455a64;
  --stateHoverTextColor: white;
  --inputBgColor: #ffffff;
  --inputTextColor: #222222;
  --invalidInputBorderColor: transparent;
  --inputGroupTextColor: #2779aa;
  --inputDefaultBorderWidth: 1px;
  --inputDefaultBorderColor: #dddddd;
  --inputDefaultBgColor: #ffffff;
  --inputDefaultTextColor: #000000;
}
input {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  margin-bottom: 5px;
  margin-top: 5px;
}
button {
  width: 100%;
  padding: 10px;
  background-color: var(--headerBgColor);
  color: var(--headerTextColor);
  border: none;
}
body {
  margin: 0;
  height: 100vh;
  width: 100vw;
}
ul {
  margin: 0;
  padding: 0;
  li {
    margin: 0;
    list-style-type: none;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transform: translateY(70vh)
}
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
.overlay {
  z-index: 1300;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.8);
  transform: translateX(-100vw);
  transition: 500ms;

  &.open {
      transform: translateX(0);
  }
}
.sidebar {
  height: 100vh;
  max-width: 300px;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #fff;
  box-shadow: 0px 0px 8px 2px black;
  z-index: 1300;
  transform: translateX(-100vw);
  transition: 300ms;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &.open {
      transform: translateX(0);
  }
  .close {
    position: absolute;
    right: 10px;
    top: 10px;
    font-size: 1.3em;
  }
  ul {
    margin-top: 10px;
    font-size: 1.3em;
    a {
      color: #2c3e50;
      text-decoration: none;
    }
    li {
      padding: 10px;
      &:hover {
        background-color: rgba(0,0,0,0.2);
        cursor: pointer;
      }
    }
    i {
      margin-right: 10px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 20px;
    }
  }
}
input, textarea {
  font-family: Jost, Helvetica, Arial, sans-serif;
}
#app {
  font-family: Jost, Helvetica, Arial, sans-serif;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.app-content {
  height: calc(100%);
  overflow: auto;
}

#nav {
  z-index: 1299;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  font-weight: bold;
  color: white;
  background-color: var(--headerBgColor);
  box-shadow: 0px 0px 9px 5px #303030;
  flex-shrink: 0;
  .trigger {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 1.5em;
    padding: 10px;
  }
  .navbar-title{
    text-align: center;
  }
  .navbar-subtitle {
    font-size: 0.8em;
    font-weight: 400;
  }
}
</style>
