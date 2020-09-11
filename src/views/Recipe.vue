<template>
  <div class="root-recipe">
    <svg-background :bottom="true" svg="recipe">
    </svg-background>
    <div class="list-container">
      <div class="form">
        <input class="name" type="text" v-model="recipe.name" placeholder="Nom...">
        <div class="line">
          <div class="field">
            <label>Goût</label>
            <vue-stars class="stars" v-model="recipe.score" name="score" shadowColor="none"/>
          </div>
          <div class="field">
            <label>Santé</label>
            <vue-stars class="stars" v-model="recipe.healthy" name="healthy" shadowColor="none"/>
          </div>

        </div>
        <button @click="update">Sauvegarder</button>
      </div>

      <div class="items-container">
        <h2>Les produits de cette recette</h2>
        <div class="filter-items">
          <i class="fas fa-search" aria-hidden="true"></i>
          <input type="text" v-model="filterItems" placeholder="Chercher un produit">
        </div>
        <div class="items-list">
          <div class="item" v-for="item of filteredItems" :key="item._id">
            <div>{{item.name}}</div>
            <div class="actions">
              <div class="delete" @click="deleteLink(item._id)"><i class="fas fa-trash" aria-hidden="true"></i></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <bottom-bar :text="(itemsForRecipe ? itemsForRecipe.length : 0) + ' produits au total'" :actions="[{icon: 'fas fa-plus', cb: linkItem}]"/>
    <modal-vue ref="linkModal">
      <div slot="header">
        Lier des produits à une recette
      </div>
      <div slot="body">
        <search-items v-model="itemsSelected"></search-items>
      </div>
    </modal-vue>
  </div>
</template>

<script>
import Recipe from '../services/Recipe';
import BottomBarVue from '../components/BottomBar.vue';
import ModalVue from '../components/Modal.vue';
import items from '../services/items';
import PromiseB from 'bluebird'
import SvgBackgroundVue from '../components/SvgBackground.vue';
import SearchItemsVue from '../components/SearchItems.vue';
import sort from 'fast-sort'
import notification from '../services/notification'
import { VueStars } from "vue-stars"

export default {
  components: {
      'bottom-bar': BottomBarVue,
      modalVue: ModalVue,
      svgBackground: SvgBackgroundVue,
      searchItems: SearchItemsVue,
      VueStars
  },
  data() {
    return {
      recipeId: null,
      recipe: {},
      itemsSelected: [],
      itemsForRecipe: [],
      filterItems: '',
    }
  },
  computed: {
    filteredItems() {
      return sort(this.itemsForRecipe.filter(item => item.name.includes(this.filterItems))).asc('name')
    }
  },
  async mounted() {
    this.recipeId = this.$route.params.recipeId 
    this.reload()
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    async reload() {
      await this.getRecipe()
    },
    async getRecipe() {
      this.recipe = await Recipe.get(this.recipeId)
      if(this.recipe.itemsId) {
        this.itemsForRecipe = await PromiseB.map(this.recipe.itemsId, itemId => items.get(itemId))
      }
    },
    async update() {
      await Recipe.createRecipe(this.recipe)
        .then(() => notification.next('success', 'La recette est mise à jour.'))
        .catch(() => notification.next('error', 'La recette n\'à pas pu être mise à jour.'))
      await this.getRecipe()
    },
    async linkItem() {
      this.$refs.linkModal.open().subscribe(async res => {
        if(!res) return 
        await Recipe.linkItems(this.recipeId, this.itemsSelected)
        this.reload()
      })
    },
    async deleteLink(itemId) {
      await Recipe.deleteLink(this.recipeId, itemId)
      return this.reload()
    }
  }
}
</script>

<style lang="scss" scoped>
.root-recipe {
  display: flex;
  flex-direction: column;
  height: 100%;
  .list-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
  }
  .form {
    margin: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .name {
      width: auto;
      margin: auto;
      border: none;
      text-align: center;
      font-size: 1.2em;
      font-weight: bold;

    }
    .line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      width: 100%;
    }
    .field {
      display: flex;
      align-items: center;
      flex-direction: column;
      .stars {
        font-size: 1.2em;
      }
    }
  }
  .items {
    height: 55vh;
    border-radius: 5px;
    border: 1px solid lightgrey;
    overflow: auto;
    .item {
      display: flex;
      justify-content: center;
      align-items: center;
      input {
        width: 10px;
      }
      &>label {
        flex-grow: 1;
        font-size: 1.2em;
      }
    }
  }
  .items-container {
    overflow: auto;      
    display: flex;
    flex-direction: column;
    .items-list {
      overflow: auto;
      .item {
        display: flex;
        justify-content: space-between;
        padding: 20px 15px;
        box-sizing: border-box;
        &:nth-child(even) {
          background-color: rgba(0,0,0,0.1)
        }
      }
    }
  }
  h2 {
    margin-top: 0;
    text-align: center;
    position: relative;
    box-sizing: border-box;
    &::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: calc(50% - (30% / 2));
      height: 1px;
      width: 30%;
      background-color: var(--headerBgColor);
    }
  }
}
  .filter-items {
    width: 95%;
    margin: auto;
    i {
      color: lightgrey;
      position: absolute;
      padding: 12px;
    }
    input {
      outline: none;
      border-radius: 20px;
      border: 1px solid lightgrey;
      padding: 5px;
      height: 30px;
      text-indent: 25px;
    }
  }
</style>