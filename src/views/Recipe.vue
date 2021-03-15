<template>
  <div class="root-recipe">
    <div class="list-container" v-if="recipe">
      <welcome :header="recipe.name" description=" " headerFontSize="1.4em">
        <div class="scores">
          <div class="score">
            <label>Santé</label>
            <stars v-model:score="recipe.healthy"/>
          </div>
          <div class="score">
            <label>Goût</label>
            <stars v-model:score="recipe.score"/>
          </div>
        </div>
      </welcome>
      <div class="items-container">
        <div class="items-list">
          <div class="item" v-for="item of itemsForRecipe" :key="item._id" :class="{missing: isInventoryMissing(item)}">
            <div class="actions">
              <div class="delete" @click="deleteLink(item._id)"><i class="fas fa-times" aria-hidden="true"></i></div>
              <button class="addToList" v-if="isInventoryMissing(item)" @click="openAddToList(item)"> <i class="fas fa-shopping-cart"></i></button>
            </div>
            <input v-if="recipe.quantities" class="item-quantity" v-model.number="recipe.quantities[item._id]"/>
            <div class="item-name">{{item.name}}</div>
          </div>
          <button class="link-item" @click="linkItem">Ajouter un ingrédient</button>
        </div>
      </div>
    </div>
    <bottom-bar :text="(itemsForRecipe ? itemsForRecipe.length : 0) + ' produits au total'" :actions="[{icon: 'fas fa-save', cb: update}]"/>
    <modal-vue ref="linkModal">
      <template #header>
        Lier des produits à une recette
      </template>
      <template #body>
        <search-items v-model:value="itemsSelected" :excludedItems="itemsForRecipe"></search-items>
      </template>
    </modal-vue>
    <modal-vue ref="addToListModal">
      <template #header>
        Insérer dans une liste
      </template>
      <template #body="{data: item}" >
        <div v-if="item" class="lists">
          <div v-for="list of lists" :key="list._id" @click="addToList(list, item)" class="list">
            {{list.name}}
            <i class="fas fa-chevron-right" aria-hidden="true"></i>
          </div>
        </div>
      </template>
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
import Welcome from '../components/dashboard/Welcome.vue';
import Stars from '../components/Stars.vue';
import { computed, onMounted, ref, watch } from '@vue/runtime-core';
import router from '../router';
import Inventory from '../services/inventory.js';
import Lists from '../services/lists';

export default {
  components: {
    'bottom-bar': BottomBarVue,
    modalVue: ModalVue,
    searchItems: SearchItemsVue,
    Welcome,
    Stars
  },
  setup() {
    const recipeId = computed(() => router.currentRoute.value.params.recipeId) 

    /** @type {import('vue').Ref<import('../services/Recipe').default>} */
    const recipe = ref(null)
    const getRecipe = async() => {
      recipe.value = await Recipe.get(recipeId.value)
    }
    onMounted(getRecipe)

    const itemsForRecipe = ref([])
    watch(() => recipe.value, async () => {
      if(recipe.value.itemsId) {
        itemsForRecipe.value = await PromiseB.map(recipe.value.itemsId, itemId => items.get(itemId))
      }
    })

    // Link ItemBehavior
    const linkModal = ref(null)
    const itemsSelected = ref([])
    const linkItem = async () => {
      linkModal.value.open().subscribe(async res => {
        if(!res) return 
        await Recipe.linkItems(recipeId.value, itemsSelected.value.map(item => item._id))
        notification.next('success', 'L\'ingrédient a été ajouté à la liste.')
        getRecipe()
      })
    }

    // delete item behavior
    const deleteLink = async (itemId) => {
      await Recipe.deleteLink(recipeId.value, itemId)
      notification.next('success', 'L\'ingrédient a été retiré à la liste.')
      return getRecipe()
    }

    // Inventory behavior
    const inventoryItemsConf = ref([])
    onMounted(async() => {
      const inventory = await Inventory.get()
      if(inventory && inventory.confs) {
        inventoryItemsConf.value = inventory.confs
      }
    })
    const isInventoryMissing = (item) => {
      const itemInInventory = inventoryItemsConf.value.find(i => i?._id === item?._id)
      return itemInInventory ? false : true
    }

    // add to list 
    const addToListModal = ref()
    const openAddToList = (item) => {
      addToListModal.value.open(item).subscribe(res => {
        console.log(res)
      }) 
    }
    const addToList = async (list, item) => {
      addToListModal.value.close()
      await Lists.addItem(list._id, {
        _id: item._id,
        selected: 0,
        total: 1
      })
      .then(() => notification.next('success', `Le produit a été ajouté à la liste ${list.name}.`))
      .catch(() => notification.next('error', `Le produit n'a pu être ajouté à la liste ${list.name}.`))
    }
    const lists = ref([])
    onMounted(async() => {
      lists.value = await Lists.getLists()
      getRecipe()
    })
    return {
      addToListModal,
      openAddToList,
      addToList,
      lists,
      recipeId,
      recipe,
      itemsSelected,
      itemsForRecipe,
      linkItem,
      deleteLink,
      linkModal,
      inventoryItemsConf,
      isInventoryMissing,
      async update() {
        await Recipe.createRecipe(recipe.value)
          .then(() => notification.next('success', 'La recette est mise à jour.'))
          .catch(() => notification.next('error', 'La recette n\'à pas pu être mise à jour.'))
        await getRecipe()
      },
      
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
        &.missing .item-name {
          color: red;
        }
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
          display: flex;
          justify-content: center;
          align-items: center;
          &>* {
            margin-right: 10px
          }
          .addToList {
            border-radius: 10px;
          }
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
  .scores {
    display: flex;
    justify-content: space-between;
    text-align: center;
    margin-top: 10px;
    .score {
      margin: 0 20px;
      label {
        display: inline-block;
        margin-bottom: 5px;
      }
    }
  }
}

.lists {
  max-height: 150px;
  overflow: auto;
  .list {
    padding: 10px 0;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    &:last-of-type {
      border-bottom: none;
    }
  }
}
</style>