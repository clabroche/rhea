<template>
  <div class="root-items">
    <svg-background :bottom="items && items.length" svg="cookie">
      <br>
      <div>Hey !</div>
      <br>
      Appuies sur le <i class="fas fa-plus" aria-hidden="true"></i> pour ajouter un produit dans cette liste
    </svg-background>
    <div class="filter-items">
      <i class="fas fa-search" aria-hidden="true"></i>
      <input type="text" v-model="filterItems" placeholder="Chercher un produit">
    </div>
    <div class="items-container" @scroll="setPosition" ref="scrollElement">
      <div v-for="item of filteredItems" :key="item._id" @click="$router.push({name:'item', params: {itemId: item._id}})">
        <line-vue
          :additionalAction="true"
          :name="item.name"
          :additionalCenter="item.price + '€' + getCategoriesForItem(item)"
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
    <modal-vue ref="confirmProduct">
      <div slot="body" slot-scope="{data}">
        <div class="confirm-product" v-if="data && data.product">
          Lier à un item existant
          <multiselect :options="items" :value="selectedItem ? [selectedItem] : []" customKey="_id" customLabel="name" :single="true" placeholder="Choisir un produit..." @input="selectedItem = $event[0]"/>
          <div v-if="!selectedItem">
            ou créer un nouvel item
            <input type="text" v-model="data.product.product_name" >
            <img :src="data.product.image_url" alt="">
          </div>
        </div>
        <div v-else>Produit non trouvé</div>
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
import MultiselectVue from '../components/Multiselect.vue';
import Category from '../services/Category';
import header from '../services/Header'
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
export default {
  components: {
    'bottom-bar': BottomBarVue,
    'modal-vue': ModalVue,
    'line-vue': LineVue,
    OptionsVue,
    multiselect: MultiselectVue,
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
      selectedItem: null,
      filterItems: ''
    }
  },
  computed: {
    filteredItems() {
      return this.items.filter(item => item.name.toUpperCase().includes(this.filterItems.toUpperCase()))
    }
  },
  async mounted() {
    header.set('Mes produits')
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
      const category = item.categoriesId.map(categoryId => this.categories[categoryId] ?  ' ' +this.categories[categoryId].name : '').join(', ')
      if(category) return  ' - ' + category
      return ''
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
    },
    async openCamera() {
      // Laurier: 3166290200647
      const { text, cancelled } = await BarcodeScanner.scan()
      if (!cancelled) {
        const data = await items.createFromBarCode(text).catch(() => ({product: null}))
        const itemsId = this.items.map(item => item._id)
        this.selectedItem = data.related.filter(item => itemsId.includes(item._id)).pop()
        this.$refs.confirmProduct.open(data).subscribe(res => {
          if(!res || !data.product) return
          if(this.selectedItem) {
            this.selectedItem.imageUrl = data.product.image_url
            this.selectedItem.barcode = text
            items.createItem(this.selectedItem)
            this.selectedItem = null
          } else {
            items.createItem({
              name : data.product.product_name,
              imageUrl: data.product.image_url,
              barcode: text,
              description : '',
              price : 0,
              categoriesId : [ ],
            })
          }
        })
      }
    },
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

.confirm-product {
  text-align: center;
  img {
    max-width: 100px;
  }
}
</style>