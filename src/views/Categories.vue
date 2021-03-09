<template>
  <div class="root-categories">
    <svg-background :bottom="categories && categories.length" svg="category">
      <br>
      <div>Hey !</div>
      <br>
      Appuies sur le <i class="fas fa-plus" aria-hidden="true"></i> pour ajouter une catégorie
    </svg-background>
    <div class="filter-items">
      <i class="fas fa-search" aria-hidden="true"></i>
      <input type="text" v-model="filterCategories" placeholder="Chercher un produit">
    </div>
    <div class="categories-container" save-scroll>
      <div v-for="category of filteredCategories" :key="category._id" @click="$router.push({name:'category', params: {categoryId: category._id}})">
        <line-vue
          :additionalLeft="category.itemsId.length"
          :additionalAction="true"
          :name="category.name"
          :description="category.description" 
          @action="openOptions(category)"
        />
      </div>
    </div>
    <bottom-bar :text="categories.length + ' catégories au total'" :actions="[{icon: 'fas fa-plus', cb: createCategory}]" />
    <modal-vue ref="createModal">
      <template #body>
        <input type="text" v-model="categoryToCreate.name" placeholder="Nom...">
      </template>
    </modal-vue>
    <options-vue ref="options" :options="[
      {label:  'Suppression', select: deleteCategory},
    ]"/>
  </div>
</template>

<script>
import BottomBarVue from '../components/BottomBar.vue';
import ModalVue from '../components/Modal.vue';
import Category from '../services/Category.js';
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
      categories: [],
      selectedCategory: null,
      categoryToCreate: {
        name: '',
      },
      filterCategories: ''
    }
  },
  computed: {
    filteredCategories() {
      return this.categories.filter(cat => cat.name.toUpperCase().includes(this.filterCategories.toUpperCase()))
    }
  },
  async mounted() {
    header.set('Catégories')
    await this.getCategories()
    Socket.socket.on('category:item:add', this.getCategories)
    Socket.socket.on('category:item:delete', this.getCategories)
    Socket.socket.on('category:delete', this.getCategories)
    Socket.socket.on('category:update', this.getCategories)
  },
  beforeUnmount() {
    Socket.socket.off('category:item:add', this.getCategories)
    Socket.socket.off('category:item:delete', this.getCategories)
    Socket.socket.off('category:delete', this.getCategories)
    Socket.socket.off('category:update', this.getCategories)
  },
  methods: {
    async openOptions(category) {
      this.$refs.options.open(category.name)
      this.selectedCategory = category
    },
    async deleteCategory() {
      await Category.deleteCategory(this.selectedCategory._id) 
      this.selecteCategory = null
      return this.getCategories()
    },
    async getCategories() {
      this.categories = await Category.getCategories()
    },
    createCategory() {
      this.$refs.createModal.open().subscribe(async res => {
        if(!res) return 
        await Category.createCategory(this.categoryToCreate)
        this.categoryToCreate = {name: ''}
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.root-categories {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  .categories-container {
    height:100%;
    padding: 0 10px;
    overflow: auto;
  }

}
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
</style>