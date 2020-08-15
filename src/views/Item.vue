<template>
  <div class="root-item">
     <svg-background :bottom="true" svg="cookie">
    </svg-background>
    <div class="form">
      <input type="text" v-model="item.name" placeholder="Nom...">
      <input type="text" v-model="item.description" placeholder="Description...">
      <input type="number" v-model="item.price" placeholder="Prix...">
      <button @click="update">Sauvegarder</button>
    </div>
    <div class="items-container">
      <h2>Ce produit appartient à ces catégories</h2>
      <multi-select :options="categories" @input="addCategories" :single="true" placeholder="Choisir une catégorie..." customKey="_id" customLabel="name" :value="categoryToAdd"></multi-select>
      <div class="items-list">
        <div class="item" v-for="category of filteredCategories" :key="category._id">
          <div>{{category.name}}</div>
          <div class="actions">
            <div class="delete" @click="deleteCategory(category._id)"><i class="fas fa-trash" aria-hidden="true"></i></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Items from '../services/items';
import SvgBackgroundVue from '../components/SvgBackground.vue';
import MultiselectVue from '../components/Multiselect.vue';
import Category from '../services/categories';
export default {
  data() {
    return {
      itemId: null,
      categoryToAdd: [],
      categories: [],
      item: {},
      categoriesById: {}
    }
  },
  components: {
    svgBackground: SvgBackgroundVue,
    multiSelect: MultiselectVue
  },
  computed: {
    filteredCategories() {
      return this.item.categoriesId
        ? this.item.categoriesId.map(categId => this.categoriesById[categId] || {})  
        : []
    }
  },
  async mounted() {
    this.itemId = this.$route.params.itemId 
    await this.getItem()
    this.categories = await Category.getCategories()
    this.categories.forEach(categ => {
      this.$set(this.categoriesById, categ._id, categ)
    })
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    async addCategories() {
      const categ = this.categoryToAdd[0]
      await Category.linkItems(categ._id, [this.itemId])
      this.categoryToAdd = []
      return this.getItem()
    },
    async getItem() {
      this.item = await Items.get(this.itemId)
    },
    async update() {
      await Items.createItem(this.item)
      await this.getItem()
    },
    async deleteCategory(categId) {
      await Category.deleteLink(categId, this.item._id)
      return this.getItem()
    }
  }
}
</script>

<style lang="scss" scoped>
.root-item {
  display: flex;
  flex-direction: column;
  height: 100%;
  .form {
    margin: 10px;
  }
  
  .items-container {
    overflow: auto;      
    display: flex;
    flex-direction: column;
    flex: 1;
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
}
</style>