<template>
  <div>
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
  </div>
</template>

<script>
import Auth from '../services/Auth'
import sidebar from '../services/sidebar'
export default {
  data() {
    return {
      sidebar
    }
  },
  computed: {
    androidURL() {
      return `${process.env.VUE_APP_SERVER_URL}:${process.env.VUE_APP_SERVER_PORT}/rhea.apk`
    }
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

<style lang="scss" scoped>
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

</style>