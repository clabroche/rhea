<template>
  <div class="root-category">
    <div class="list-container">
      <div class="form">
        <input type="text" v-model="category.name" placeholder="Nom...">
        <button @click="update">Sauvegarder</button>
      </div>

      <div class="items-container">
        <h2>Les produits de cette catégorie</h2>
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
    <bottom-bar :text="(itemsForCategory ? itemsForCategory.length : 0) + ' listes au total'" @action="linkItem" />
    <modal-vue ref="linkModal">
      <div slot="header">
        Lier des produits à une catégorie
      </div>
      <div slot="body">
        <div class="items">
          <div class="item" v-for="item of allItemsMinusItemInCategory" :key="item._id">
            <input type="checkbox" :id="item._id" v-model="itemsSelected" :value="item._id">
            <label :for="item._id">{{item.name}}</label>
          </div>
        </div>
      </div>
    </modal-vue>
  </div>
</template>

<script>
import Categories from '../services/categories';
import BottomBarVue from '../components/BottomBar.vue';
import ModalVue from '../components/Modal.vue';
import items from '../services/items';
import PromiseB from 'bluebird'
export default {
  components: {
      'bottom-bar': BottomBarVue,
      modalVue: ModalVue
  },
  data() {
    return {
      categoryId: null,
      category: {},
      allItems: [],
      itemsSelected: [],
      itemsForCategory: [],
      filterItems: ''
    }
  },
  computed: {
    allItemsMinusItemInCategory() {
      return this.allItems.filter(a => !this.itemsForCategory.map(it => it._id).includes(a._id))
    },
    filteredItems() {
      return this.itemsForCategory.filter(item => item.name.includes(this.filterItems))
    }
  },
  async mounted() {
    this.categoryId = this.$route.params.categoryId 
    this.reload()
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    async reload() {
      await this.getCategory()
      this.allItems = await items.getAll()
    },
    async getCategory() {
      this.category = await Categories.get(this.categoryId)
      if(this.category.itemsId) {
        this.itemsForCategory = await PromiseB.map(this.category.itemsId, itemId => items.get(itemId))
      }
    },
    async update() {
      await Categories.createCategory(this.category)
      await this.getCategory()
    },
    async linkItem() {
      this.$refs.linkModal.open().subscribe(async res => {
        if(!res) return 
        await Categories.linkItems(this.categoryId, this.itemsSelected)
        this.itemsSelected = []
        this.reload()
      })
    },
    async deleteLink(itemId) {
      await Categories.deleteLink(this.categoryId, itemId)
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
    margin: 10px;
  }
  .items {
    height: 55vh;
    border-radius: 5px;
    border: 1px solid lightgrey;
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
}
</style>