import Vue from 'vue'
import VueRouter from 'vue-router'
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

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: {name: 'lists'},
  },{
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
  },
]

const router = new VueRouter({
  routes
})

export default router
