<template>
  <div class="root-recipe">
    <svg-background :bottom="true" svg="recipe">
    </svg-background>
    <div class="list-container">
      <div class="form">
        <input type="text" v-model="recipe.name" placeholder="Nom...">
        <button @click="update">Sauvegarder</button>
      </div>

      <div class="items-container">
        <h2>Les produits de cette recette</h2>
        <div class="filter-items">
          <i class="fas fa-search"></i>
          <input type="text" v-model="filterItems" placeholder="Chercher un produit">
        </div>
        <div class="items-list">
          <div class="item" v-for="item of filteredItems" :key="item._id">
            <div>{{item.name}}</div>
            <div class="actions">
              <div class="delete" @click="deleteLink(item._id)"><i class="fas fa-trash"></i></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <bottom-bar :text="(itemsForRecipe ? itemsForRecipe.length : 0) + ' listes au total'" @action="linkItem" />
    <modal-vue ref="linkModal">
      <div slot="header">
        Lier des produits à une recette
      </div>
      <div slot="body">
        <div class="filter-container">
          <div class="filter-items">
            <i class="fas fa-search"></i>
            <input type="text" v-model="filterItemsInPopup" placeholder="Chercher un produit">
          </div>
           <div class="checkbox-container">
            <input type="checkbox"  v-model="onlyNotCategorize">
            <label @click="onlyNotCategorize = !onlyNotCategorize">
              <span></span>
            </label>
          </div>
        </div>
        <div v-if="onlyNotCategorize" class="only-not-categorize">
          Seul les produits sans recette sont affichés
        </div>
        <div class="items">
          <div class="item" v-for="item of allItemsMinusItemInRecipe" :key="item._id">
            <div class="checkbox-container">
              <input type="checkbox"  :id="item._id" v-model="itemsSelected" :value="item._id">
              <label :for="item._id">
                <span></span>
                {{item.name}}
              </label>
            </div>
          </div>
        </div>
      </div>
    </modal-vue>
  </div>
</template>

<script>
import Recipes from '../services/recipes';
import BottomBarVue from '../components/BottomBar.vue';
import ModalVue from '../components/Modal.vue';
import items from '../services/items';
import PromiseB from 'bluebird'
import sort from 'fast-sort'
import SvgBackgroundVue from '../components/SvgBackground.vue';
export default {
  components: {
      'bottom-bar': BottomBarVue,
      modalVue: ModalVue,
      svgBackground: SvgBackgroundVue
  },
  data() {
    return {
      recipeId: null,
      recipe: {},
      allItems: [],
      itemsSelected: [],
      itemsForRecipe: [],
      filterItems: '',
      filterItemsInPopup: '',
      onlyNotCategorize: false,
    }
  },
  computed: {
    allItemsMinusItemInRecipe() {
      const itemFilter = item => {
        const isNotFiltered = item.name.includes(this.filterItemsInPopup) && !this.itemsForRecipe.map(it => it._id).includes(item._id)
        if(isNotFiltered && this.onlyNotCategorize) {
          console.log(item)
          return !item.recipesId || !item.recipesId.length
        }
        return isNotFiltered
      } 
      return sort(this.allItems.filter(itemFilter)).asc('name')
    },
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
      this.allItems = await items.getAll()
    },
    async getRecipe() {
      this.recipe = await Recipes.get(this.recipeId)
      if(this.recipe.itemsId) {
        this.itemsForRecipe = await PromiseB.map(this.recipe.itemsId, itemId => items.get(itemId))
      }
    },
    async update() {
      await Recipes.createRecipe(this.recipe)
      await this.getRecipe()
    },
    async linkItem() {
      this.$refs.linkModal.open().subscribe(async res => {
        if(!res) return 
        await Recipes.linkItems(this.recipeId, this.itemsSelected)
        this.itemsSelected = []
        this.reload()
      })
    },
    async deleteLink(itemId) {
      await Recipes.deleteLink(this.recipeId, itemId)
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
      left: calc(50% - (30% /2));
      height: 1px;
      width: 30%;
      background-color: var(--headerBgColor);
    }
  }
  .filter-container {
    display: flex;
    .checkbox-container {
      width: auto;
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

  .only-not-categorize {
    font-size: 0.8em;
  }
  .checkbox-container {
    display: flex;
    width: 100%;
  }
  input[type='checkbox']{ height: 0; width: 0; }

  input[type='checkbox'] + label{
    position: relative;
    display: flex;
    margin: .6em 0;
    align-items: center;
    color: #2c3e50;
    transition: color 250ms cubic-bezier(.4,.0,.23,1);
  }
  input[type='checkbox'] + label > ins{
    position: absolute;
    display: block;
    bottom: 0;
    left: 2em;
    height: 0;
    width: 100%;
    overflow: hidden;
    text-decoration: none;
    transition: height 300ms cubic-bezier(.4,.0,.23,1);
  }
  input[type='checkbox'] + label > span{
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-right: 1em;
    width: 1.5em;
    height: 1.5em;
    background: transparent;
    border: 2px solid #9E9E9E;
    border-radius: 2px;
    cursor: pointer;  
    transition: all 250ms cubic-bezier(.4,.0,.23,1);
  }


  input[type='checkbox']:checked + label > span{
    animation: shrink-bounce 200ms cubic-bezier(.4,.0,.23,1);
  }
  input[type='checkbox']:checked + label > span:before{
    content: "";
    position: absolute;
    top: .2em;
    left: .2em;
    border-right: 4px solid transparent;
    border-bottom: 4px solid transparent;
    transform: rotate(45deg);
    transform-origin: 0% 100%;
    animation: checkbox-check 125ms 250ms cubic-bezier(.4,.0,.23,1) forwards;
    border-color: #9E9E9E
  }
}

@keyframes checkbox-check{
  0%{
    width: 0;
    height: 0;
    border-color: #212121;
    transform: translate3d(0,0,0) rotate(45deg);
  }
  33%{
    width: .2em;
    height: 0;
    transform: translate3d(0,0,0) rotate(45deg);
  }
  100%{    
    width: .4em;
    height: .8em;    
    border-color: var(--headerBgColor);
    transform: translate3d(0,-0.5em,0) rotate(45deg);
  }
}

@keyframes shrink-bounce{
  0%{
    transform: scale(1);
  }
  33%{    
    transform: scale(.85);
  }
  100%{
    transform: scale(1);    
  }
}
</style>