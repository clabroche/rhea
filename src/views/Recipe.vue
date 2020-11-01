<template>
  <div class="root-recipe">
    <div class="list-container">
      <div class="form">
        <input class="name" type="text" v-model="recipe.name" placeholder="Nom...">
        <div class="line">
          <div class="field">
            <label>Goût</label>
            <vue-stars class="stars" @input="recipe.score = $event" :value="recipe.score || 0" name="score" shadowColor="none"/>
          </div>
          <div class="field">
            <label>Santé</label>
            <vue-stars class="stars" @input="recipe.healthy = $event" :value="recipe.healthy || 0" name="healthy" shadowColor="none"/>
          </div>
        </div>
      </div>

      <div class="items-container">
        <h2>Les produits de cette recette</h2>
        <div class="items-list">
          <div class="item" v-for="item of itemsForRecipe" :key="item._id">
            <div class="actions">
              <div class="delete" @click="deleteLink(item._id)"><i class="fas fa-times" aria-hidden="true"></i></div>
            </div>
            <input class="item-quantity" :value="item.quantity || 1"/>
            <div class="item-name">{{item.name}}</div>
          </div>
          <button class="link-item" @click="linkItem">Ajouter un ingrédient</button>
        </div>
      </div>
    </div>
    <bottom-bar :text="(itemsForRecipe ? itemsForRecipe.length : 0) + ' produits au total'" :actions="[{icon: 'fas fa-save', cb: update}]"/>
    <modal-vue ref="linkModal">
      <div slot="header">
        Lier des produits à une recette
      </div>
      <div slot="body">
        <search-items v-model="itemsSelected" :excludedItems="itemsForRecipe"></search-items>
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
import SearchItemsVue from '../components/SearchItems.vue';
import notification from '../services/notification'
import { VueStars } from "vue-stars"
import header from '../services/Header'

export default {
  components: {
      'bottom-bar': BottomBarVue,
      modalVue: ModalVue,
      searchItems: SearchItemsVue,
      VueStars
  },
  data() {
    return {
      recipeId: null,
      recipe: {},
      itemsSelected: [],
      itemsForRecipe: [],
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
      header.set('Ma recette', this.recipe.name)
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
        await Recipe.linkItems(this.recipeId, this.itemsSelected.map(item => item._id))
        notification.next('success', 'L\'ingrédient a été ajouté à la liste.')
        this.reload()
      })
    },
    async deleteLink(itemId) {
      await Recipe.deleteLink(this.recipeId, itemId)
      notification.next('success', 'L\'ingrédient a été retiré à la liste.')
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
      border: none;
      text-align: center;
      font-size: 1.4em;
      margin: 10px auto;
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
        padding: 10px 15px;
        box-sizing: border-box;
        .item-quantity {
          width: 30px;
          margin: 0;
          margin-right: 10px;
          border-radius: 4px;
          background-color: rgba(0,0,0,0.1);
          text-align: center;
          padding: 0;
          border: none;
        }
        .actions {
          margin-right: 10px
        }
      }
      .link-item {
        background-color: transparent;
        color: darkgrey;
        border: 1px dashed darkgrey;
        width: calc(100% - 20px);
        margin-left: 10px;
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
</style>