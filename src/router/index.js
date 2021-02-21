import { createRouter, createWebHashHistory } from 'vue-router'
import Lists from '../views/Lists.vue'
import List from '../views/List.vue'
import Item from '../views/Item.vue'
import Items from '../views/Items.vue'
import Login from '../views/Login.vue'
import Categories from '../views/Categories.vue'
import Category from '../views/Category.vue'
import Recipes from '../views/Recipes.vue'
import Recipe from '../views/Recipe.vue'
import Inventory from '../views/Inventory.vue'
import Calendar from '../views/Calendar.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: { name: 'dashboard' },
  }, {
    path: '/lists',
    name: 'lists',
    component: Lists
  },{
    path: '/list/:listId',
    name: 'list',
    component: List
  }, {
    path: '/item/:itemId',
    name: 'item',
    component: Item
  }, {
    path: '/items',
    name: 'items',
    component: Items
  }, {
    path: '/categories',
    name: 'categories',
    component: Categories
  }, {
    path: '/categories/:categoryId',
    name: 'category',
    component: Category
  }, {
    path: '/recipes',
    name: 'recipes',
    component: Recipes
  }, {
    path: '/recipes/:recipeId',
    name: 'recipe',
    component: Recipe
  }, {
    path: '/inventory',
    name: 'inventory',
    component: Inventory
  }, {
    path: '/login',
    name: 'login',
    component: Login
  }, {
    path: '/register',
    name: 'register',
    props: { register: true },
    component: Login
  }, {
    path: '/calendar',
    name: 'calendar',
    component: Calendar
  }, {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard
  },
  { path: '/:pathMatch(.*)*', redirect: {name: 'home'} },
]



const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
