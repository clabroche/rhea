<template>
  <div class="root-items">
    <svg-background :bottom="items && items.length" svg="cookie">
      <br>
      <div>Hey !</div>
      <br>
      Appuies sur le <i class="fas fa-plus"></i> pour ajouter un produit dans cette liste
    </svg-background>
    <div class="items-container" @scroll="setPosition" ref="scrollElement">
      <div v-for="item of items" :key="item._id" @click="$router.push({name:'item', params: {itemId: item._id}})">
        <line-vue
          :additionalAction="true"
          :name="item.name"
          :additionalCenter="getCategoriesForItem(item)"
          :description="item.description"
          @action="openOptions(item)"/>
      </div>
    </div>
    <bottom-bar :text="items.length + ' items au total'" :actions="[{icon: 'fas fa-barcode', cb: openCamera}, {icon: 'fas fa-plus', cb: createItem}]" />
    <modal-vue ref="createModal">
      <div slot="body">
        <input type="text" v-model="itemToCreate.name" placeholder="Nom...">
        <input type="text" v-model="itemToCreate.description" placeholder="Description...">
        <input type="number" v-model="itemToCreate.price" placeholder="Prix...">
      </div>
    </modal-vue>
    <options-vue ref="options" :options="[
      {label:  'Modifier', select: update},
      {label:  'Suppression', select: deleteItem},
    ]"/>
  </div>
</template>

<script>
import BottomBarVue from '../components/BottomBar.vue';
import ModalVue from '../components/Modal.vue';
import items from '../services/items.js';
import LineVue from '../components/Line.vue'
import OptionsVue from '../components/Options.vue';
import SvgBackgroundVue from '../components/SvgBackground.vue';
import Category from '../services/categories';
export default {
  components: {
    'bottom-bar': BottomBarVue,
    'modal-vue': ModalVue,
    'line-vue': LineVue,
    OptionsVue,
    svgBackground: SvgBackgroundVue
  }, 
  data() {
    return {
      items: [],
      itemToCreate: {
        name: '',
        description: ''
      },
      categories: {},
      selectedItem: null
    }
  },
  async mounted() {
    await this.getAllItems()
    const categories = await Category.getCategories() 
    categories.forEach(categ => this.categories[categ._id] = categ)
    this.$refs.scrollElement.scrollTop = this.$root.scroll.listItems
    this.interval = setInterval(async () => {
        this.getAllItems()
      }, 500);
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    setPosition() {
      this.$root.scroll.listItems = this.$refs.scrollElement.scrollTop
    },
    getCategoriesForItem(item) {
      return item.categoriesId.map(categoryId => this.categories[categoryId] ?  ' ' +this.categories[categoryId].name : '').join(', ')
    },
    async getAllItems() {
      this.items = await items.getAll()
    },
    update() {
      this.itemToCreate = this.selectedItem
      this.createItem()
    },
    async deleteItem() {
      await items.remove(this.selectedItem._id)
      this.itemToCreate = {}
      this.selectedItem = null
      this.getAllItems()
    },
    openOptions(item) {
      this.$refs.options.open(item.name)
      this.selectedItem = item
    },
    createItem() {
      this.$refs.createModal.open().subscribe(async res => {
        if(!res) return 
        await items.createItem(this.itemToCreate)
        this.itemToCreate = {}
        this.selectedItem = null
        this.getAllItems()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.root-items {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  .items-container {
    height:100%;
    padding: 10px;
    overflow: auto;
  }

}
</style>