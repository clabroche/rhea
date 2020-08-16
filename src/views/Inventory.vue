<template>
  <div class="root-items">
    <svg-background :bottom="items && items.length" svg="inventory">
      <br>
      <div>Hey !</div>
      <br>
      Appuies sur le <i class="fas fa-plus" aria-hidden="true"></i> pour ajouter un produit dans ton inventaire
    </svg-background>
    <div class="items-container" @scroll="setPosition" ref="scrollElement">
      <div v-for="item of items" :key="item._id" @click="openItem(item)">
        <line-vue
          :additionalAction="true"
          :additionalLeft="item.total"
          :name="item.name"
          :additionalCenter="getCategoriesForItem(item)"
          :description="item.description"
          @action="openOptions(item)"/>
      </div>
    </div>
    <bottom-bar :text="items.length + ' items au total'" :actions="[{icon: 'fas fa-plus', cb: createItem}]"/>
    <modal-vue ref="createModal">
      <div slot="body">
        <multiselect :options="allItems" customKey="_id" customLabel="name" :single="true" placeholder="Choisir un produit..." @input="selectedItem = $event[0]"/>
      </div>
    </modal-vue>
    <modal-vue ref="updateModal">
      <div slot="body" slot-scope="{data}" v-if="data && data._id">
        <h2>{{data.name}}</h2>
        <div class="increment-container">
          <i class="fas fa-minus" @click="data.total--"></i>
          {{data.total}}
          <i class="fas fa-plus" @click="data.total++"></i>
        </div>
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
import inventory from '../services/inventory.js';
import LineVue from '../components/Line.vue'
import OptionsVue from '../components/Options.vue';
import SvgBackgroundVue from '../components/SvgBackground.vue';
import Category from '../services/Category';
import MultiselectVue from '../components/Multiselect.vue';
export default {
  components: {
    'bottom-bar': BottomBarVue,
    'modal-vue': ModalVue,
    'line-vue': LineVue,
    multiselect: MultiselectVue,
    OptionsVue,
    svgBackground: SvgBackgroundVue
  }, 
  data() {
    return {
      items: [],
      allItems: [],
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
    // this.interval = setInterval(async () => {
    //     this.getAllItems()
    //   }, 500);
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    openItem(item) {
      this.$refs.updateModal.open(item).subscribe(async res=> {
        if(!res) return
        await inventory.updateTotal(item._id, item.total)
        await this.getAllItems()
      }) 
    },
    setPosition() {
      this.$root.scroll.listItems = this.$refs.scrollElement.scrollTop
    },
    getCategoriesForItem(item) {
      return item.categoriesId.map(categoryId => this.categories[categoryId] ?  ' ' +this.categories[categoryId].name : '').join(', ')
    },
    async getAllItems() {
      this.allItems = await items.getAll() 
      this.items = await inventory.getItems()
    },
    update() {
      this.itemToCreate = this.selectedItem
      this.createItem()
    },
    async deleteItem() {
      await inventory.remove(this.selectedItem._id)
      this.selectedItem = null
      this.getAllItems()
    },
    openOptions(item) {
      this.$refs.options.open(item.name)
      this.selectedItem = item
    },
    createItem() {
      this.$refs.createModal.open().subscribe(async res => {
        console.log(this.selectedItem)
        if(!res || !this.selectedItem._id) return 
        await inventory.addItem(this.selectedItem._id)
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
.increment-container {
  width: 150px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  i {
    background-color: var(--headerBgColorAccent);
    color: var(--headerTextColorAccent);
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>