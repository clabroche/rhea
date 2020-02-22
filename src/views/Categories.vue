<template>
  <div class="root-categories">
    <div class="categories-container">
      <div v-for="category of categories" :key="category._id" @click="$router.push({name:'category', params: {categoryId: category._id}})">
        <line-vue
          :additionalAction="true"
          :name="category.name"
          :description="category.description" 
          @action="openOptions(category)"
        />
      </div>
    </div>
    <bottom-bar :text="categories.length + ' catégories au total'" @action="createCategory" />
    <modal-vue ref="createModal">
      <div slot="body">
        <input type="text" v-model="categoryToCreate.name" placeholder="Nom...">
      </div>
    </modal-vue>
    <options-vue ref="options" :options="[
      {label:  'Suppression', select: deleteCategory},
    ]"/>
  </div>
</template>

<script>
import BottomBarVue from '../components/BottomBar.vue';
import ModalVue from '../components/Modal.vue';
import Categories from '../services/categories.js';
import LineVue from '../components/Line.vue'
import OptionsVue from '../components/Options.vue';
export default {
  components: {
    'bottom-bar': BottomBarVue,
    'modal-vue': ModalVue,
    'line-vue': LineVue,
    optionsVue: OptionsVue
  }, 
  data() {
    return {
      categories: [],
      selectedCategory: null,
      categoryToCreate: {
        name: '',
      }
    }
  },
  async mounted() {
    await this.getCategories()
    this.interval = setInterval(async () => {
      await this.getCategories()
    }, 500);
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    async openOptions(category) {
      this.$refs.options.open(category.name)
      this.selectedCategory = category
    },
    async deleteCategory() {
      await Categories.deleteCategory(this.selectedCategory._id) 
      this.selecteCategory = null
      return this.getCategories()
    },
    async getCategories() {
      this.categories = await Categories.getCategories()
    },
    createCategory() {
      this.$refs.createModal.open().subscribe(async res => {
        if(!res) return 
        await Categories.createCategory(this.categoryToCreate)
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
    padding: 10px;
    overflow: auto;
  }

}
</style>