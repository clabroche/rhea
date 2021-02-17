<template>
  <div id="nav" v-if="$route.name !== 'login'">
    <div class="trigger" v-if="Auth.user" @click="sidebar.open = true"><i class="fas fa-list" aria-hidden="true"></i></div>
    <div class="navbar-title">
      {{Header.title}}
      <div v-if="Header.subtitle" class="navbar-subtitle">
        {{Header.subtitle}}
      </div>
    </div>
  </div>
</template>

<script>
import Auth from '../services/Auth'
import Header from '../services/Header'
import sidebar from '../services/sidebar'
export default {
  data() {
    return {
      sidebar,
      Header,
      Auth
    }
  }
}
</script>

<style lang="scss" scoped>
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