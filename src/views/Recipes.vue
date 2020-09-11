<template>
  <div class="root-recipes">
    <svg-background :bottom="recipes && recipes.length" svg="recipe">
      <br>
      <div>Hey !</div>
      <br>
      Appuies sur le <i class="fas fa-plus" aria-hidden="true"></i> pour ajouter une recette
    </svg-background>
    <div class="recipes-container" ref="scrollElement" @scroll="setPosition">
      <div v-for="recipe of recipes" :key="recipe._id" @click="$router.push({name:'recipe', params: {recipeId: recipe._id}})">
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
      <div slot="body">
        <input type="text" v-model="recipeToCreate.name" placeholder="Nom...">
      </div>
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
      recipeToCreate: {
        name: '',
      }
    }
  },
  async mounted() {
    await this.getRecipes()
    this.$refs.scrollElement.scrollTop = this.$root.scroll.listRecipes
    this.interval = setInterval(async () => {
      await this.getRecipes()
    }, 500);
  },
  beforeDestroy() {
    clearInterval(this.interval)
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
        await Recipe.createRecipe(this.recipeToCreate)
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
  .recipes-container {
    height:100%;
    padding: 10px;
    overflow: auto;
  }

}
</style>