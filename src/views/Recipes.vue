<template>
  <div class="root-recipes">
    <svg-background :bottom="recipes && recipes.length" svg="recipe">
      <br>
      <div>Hey !</div>
      <br>
      Appuies sur le <i class="fas fa-plus" aria-hidden="true"></i> pour ajouter une recette
    </svg-background>
    <div class="filter-items">
      <i class="fas fa-search" aria-hidden="true"></i>
      <input type="text" v-model="filterItems" placeholder="Chercher un produit">
    </div>
    <div class="recipes-container" ref="scrollElement" @scroll="setPosition">
      <div v-for="recipe of filteredRecipes" :key="recipe._id" @click="$router.push({name:'recipe', params: {recipeId: recipe._id}})">
        <line-vue
          :additionalLeft="recipe.itemsId.length"
          :additionalAction="true"
          :name="recipe.name"
          :description="recipe.description" 
          @action="openOptions(recipe)"
        />
      </div>
    </div>
    <bottom-bar :text="recipes.length + ' recettes au total'" :actions="[{icon: 'fas fa-plus', cb: createRecipe}]"/>
    <modal-vue ref="createModal">
      <template #body>
        <input type="text" v-model="recipeToCreate.name" placeholder="Nom...">
      </template>
    </modal-vue>
    <options-vue ref="options" :options="[
      {label:  'Suppression', select: deleteRecipe},
    ]"/>
  </div>
</template>

<script>
import BottomBarVue from '../components/BottomBar.vue';
import ModalVue from '../components/Modal.vue';
import Recipe from '../services/Recipe';
import LineVue from '../components/Line.vue'
import OptionsVue from '../components/Options.vue';
import SvgBackgroundVue from '../components/SvgBackground.vue';
import header from '../services/Header'
import Socket from '../services/Socket';
export default {
  components: {
    'bottom-bar': BottomBarVue,
    'modal-vue': ModalVue,
    'line-vue': LineVue,
    optionsVue: OptionsVue,
    svgBackground: SvgBackgroundVue
  }, 
  data() {
    return {
      recipes: [],
      selectedRecipe: null,
      filterItems: '',
      recipeToCreate: {
        name: '',
      }
    }
  },
  computed: {
    filteredRecipes() {
      return this.recipes.filter(recipe => recipe.name.toUpperCase().includes(this.filterItems.toUpperCase()))
    }
  },
  async mounted() {
    header.set('Mes recettes')
    await this.getRecipes()
    this.$refs.scrollElement.scrollTop = this.$root.scroll.listRecipes
    Socket.socket.on('recipes:update', this.getRecipes)
    Socket.socket.on('recipes:item:add', this.getRecipes)
    Socket.socket.on('recipes:item:delete', this.getRecipes)
    Socket.socket.on('recipes:delete', this.getRecipes)
  },
  beforeUnmount() {
    Socket.socket.off('recipes:update', this.getRecipes)
    Socket.socket.off('recipes:item:add', this.getRecipes)
    Socket.socket.off('recipes:item:delete', this.getRecipes)
    Socket.socket.off('recipes:delete', this.getRecipes)
  },
  methods: {
    setPosition() {
      this.$root.scroll.listRecipes = this.$refs.scrollElement.scrollTop
    },
    async openOptions(recipe) {
      this.$refs.options.open(recipe.name)
      this.selectedRecipe = recipe
    },
    async deleteRecipe() {
      await Recipe.deleteRecipe(this.selectedRecipe._id) 
      this.selecteRecipe = null
      return this.getRecipes()
    },
    async getRecipes() {
      this.recipes = await Recipe.getRecipes()
    },
    createRecipe() {
      this.$refs.createModal.open().subscribe(async res => {
        if(!res) return 
        const recipe = await Recipe.createRecipe(this.recipeToCreate)
        this.$router.push({name: 'recipe', params: {recipeId: recipe._id}})
        this.recipeToCreate = {name: ''}
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.root-recipes {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  .filter-items {
    width: 95%;
    margin: auto;
    margin-top: 10px;
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
  .recipes-container {
    height:100%;
    padding: 0 10px;
    overflow: auto;
  }

}
</style>