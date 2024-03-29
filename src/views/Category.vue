<template>
  <div class="root-category">
    <div class="list-container">
      <div class="form">
        <input type="text" v-model="category.name" placeholder="Nom...">
      </div>

      <div class="items-container">
        <h2>Les produits de cette catégorie</h2>
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
    <bottom-bar :text="(itemsForCategory ? itemsForCategory.length : 0) + ' listes au total'" :actions="[{icon: 'fas fa-plus', cb: linkItem}, {icon: 'fas fa-save', cb: update}]" />
    <modal-vue ref="linkModal">
      <template #header>
        Lier des produits à une catégorie
      </template>
      <template #body>
        <search-items v-model:value="itemsSelected" :onlyNotCategorizeActive="true"></search-items>
      </template>
    </modal-vue>
  </div>
</template>

<script>
import Category from '../services/Category';
import BottomBarVue from '../components/BottomBar.vue';
import ModalVue from '../components/Modal.vue';
import items from '../services/items';
import PromiseB from 'bluebird'
import sort from 'fast-sort'
import header from '../services/Header'
import SearchItems from '../components/SearchItems.vue';
export default {
  components: {
    'bottom-bar': BottomBarVue,
    modalVue: ModalVue,
    SearchItems,
  },
  data() {
    return {
      categoryId: null,
      category: {},
      allItems: [],
      itemsSelected: [],
      itemsForCategory: [],
      filterItems: '',
      filterItemsInPopup: '',
      onlyNotCategorize: false,
    }
  },
  computed: {
    allItemsMinusItemInCategory() {
      const itemFilter = item => {
        let isNotFiltered = true
        if(item.name && this.filterItemsInPopup) {
          isNotFiltered = item.name.toUpperCase().includes(this.filterItemsInPopup.toUpperCase()) && !this.itemsForCategory.map(it => it._id).includes(item._id)
        }
        if(isNotFiltered && this.onlyNotCategorize) {
          return !item.categoriesId || !item.categoriesId.length
        }
        return isNotFiltered
      } 
      return sort(this.allItems.filter(itemFilter)).asc('name')
    },
    filteredItems() {
      return sort(this.itemsForCategory.filter(item => item ? item.name.toUpperCase().includes(this.filterItems.toUpperCase()): '')).asc('name')
    }
  },
  async mounted() {
    this.categoryId = this.$route.params.categoryId 
    this.reload()
  },
  beforeUnmount() {
    clearInterval(this.interval)
  },
  methods: {
    async reload() {
      await this.getCategory()
      this.allItems = await items.getAll()
    },
    async getCategory() {
      this.category = await Category.get(this.categoryId)
      header.set('Ma catégorie', this.category.name)
      if(this.category.itemsId) {
        this.itemsForCategory = await PromiseB.map(this.category.itemsId, itemId => items.get(itemId))
      }
    },
    async update() {
      await Category.createCategory(this.category)
      await this.getCategory()
    },
    async linkItem() {
      this.$refs.linkModal.open().subscribe(async res => {
        if(!res) return 
        await Category.linkItems(this.categoryId, this.itemsSelected.map(item => item._id))
        this.itemsSelected = []
        this.reload()
      })
    },
    async deleteLink(itemId) {
      await Category.deleteLink(this.categoryId, itemId)
      return this.reload()
    }
  }
}
</script>

<style lang="scss" scoped>
.root-category {
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
    margin-top: 10px;
    input {
      border: none;
      font-size: 1.2em;
      font-weight: bold;
      text-align: center;
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
        padding: 10px 15px;
        box-sizing: border-box;
      }
    }
  }
  h2 {
    margin-top: 0;
    text-align: center;
    font-size: 1em;
    position: relative;
    box-sizing: border-box;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: calc(50% - (30% / 2));
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