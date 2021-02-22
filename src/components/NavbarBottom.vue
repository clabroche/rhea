<template>
  <div class="navbar-bottom-root" v-if="isShowing()">
    <ul class="main-routes">
      <li 
        :class="{active: $route.name === route.route}"
        v-for="route of mainRoutes" :key="route.label"
        @click="$router.push({name: route.route})">
        <i :class="route.icon" aria-hidden="true"></i>
        {{route.label}}
      </li>
      <li class="more" @click="openSidebar"><i class="fas fa-ellipsis-h"></i></li>
    </ul>
  </div>
</template>

<script>
import { computed } from 'vue'
import router from '../router'
import sidebar from '../services/sidebar'
export default {
  setup() {
    const routes =  [
      {route: 'lists', icon: 'fas fa-list', label: 'Listes'},
      {route: 'items', icon: 'fas fa-cookie', label: 'Produits'},
      {route: 'dashboard', icon: 'fas fa-home', label: 'Accueil'},
      {route: 'inventory', icon: 'fas fa-database', label: 'Inventaire'},
      {route: 'categories', icon: 'fas fa-th', label: 'Categories'},
      {route: 'recipes', icon: 'fas fa-clipboard', label: 'Recettes'},
      {route: 'calendar', icon: 'fas fa-calendar', label: 'Calendrier'},
    ]
    return {
      mainRoutes:computed(() => routes.slice(0, 4)),
      isShowing() {
        return !['login', 'register'].includes(router.currentRoute.value.name?.toString())
      },
      openSidebar() {
        sidebar.open = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar-bottom-root {
  box-shadow: 0 0 10px 0px lightgrey;
  z-index: 1;
  color: var(--headerBgColor);
  .main-routes {
    display: flex;
    justify-content: space-between;
    width: 100vw;
    li {
      transition: 300ms;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 10px;
      box-sizing: border-box;
    }
    .active {
      color: white;
      background-color:var(--headerBgColor);
    }
  }
}
</style>