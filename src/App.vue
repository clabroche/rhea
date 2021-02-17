<template>
  <div id="app">
    <sidebar/>
    <navbar/>
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
  --headerBgColorAccent: #2c3e50;
  --headerBgColorAccentGradient: #508ab1;
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
  font-family: Jost, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
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
