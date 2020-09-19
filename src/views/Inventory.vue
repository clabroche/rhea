<template>
  <div class="root-items">
    <svg-background :bottom="items && items.length" svg="inventory">
      <br>
      <div>Hey !</div>
      <br>
      Appuies sur le <i class="fas fa-plus" aria-hidden="true"></i> pour ajouter un produit dans ton inventaire
    </svg-background>
    <div class="filter-items">
      <i class="fas fa-search" aria-hidden="true"></i>
      <input type="text" v-model="filterInventory" placeholder="Chercher un produit">
    </div>
    <div class="items-container" @scroll="setPosition" ref="scrollElement">
      <div v-for="item of filteredItems" :key="item._id" @click="openItem(item)">
        <line-vue
          :additionalLeft="item.total"
          :name="item.name"
          :additionalCenter="getCategoriesForItem(item)"
          :description="item.description"/>
      </div>
    </div>
    <bottom-bar :text="items.length + ' items au total'" :actions="[{icon: 'fas fa-barcode', cb: openCamera}, {icon: 'fas fa-plus', cb: createItem}]"/>
    <modal-vue ref="createModal">
      <div slot="body">
        <multiselect :options="allItems" customKey="_id" customLabel="name" :single="true" placeholder="Choisir un produit..." @input="selectedItem = $event[0]"/>
      </div>
    </modal-vue>
    <modal-vue ref="updateModal">
      <div slot="body" slot-scope="{data}" v-if="data && data._id">
        <h2>{{data.name}}</h2>
        <div class="increment-container">
          <i class="fas fa-minus" @click="data.total--" aria-hidden="true"></i>
          {{data.total}}
          <i class="fas fa-plus" @click="data.total++" aria-hidden="true"></i>
        </div>
      </div>
      <div v-else-if="data && data.product" class="confirm-product">
        <h2>{{data.product.product_name}}</h2>
        <img :src="data.product.image_url" alt="">
      </div>
      <div v-else>Produit non trouvé</div>
    </modal-vue>

    <modal-vue ref="createItemModal" validateString="Oui" cancelString="Non">
      <div  slot="body" slot-scope="{data}"  v-if="data && data.product" class="confirm-product">
        Lier à un item existant
        <multiselect :options="allItems" :value="selectedItem ? [selectedItem] : []" customKey="_id" customLabel="name" :single="true" placeholder="Choisir un produit..." @input="selectedItem = $event[0]"/>
        <div v-if="!selectedItem">
          ou créer un nouvel item
          <input type="text" v-model="data.product.product_name" >
          <img :src="data.product.image_url" alt="">
        </div>
        <div>
          Produit inexistant, le créer ?
        </div>
      </div>
      <div v-else>Produit non trouvé</div>
    </modal-vue>
  </div>
</template>

<script>
import BottomBarVue from '../components/BottomBar.vue';
import ModalVue from '../components/Modal.vue';
import items from '../services/items.js';
import inventory from '../services/inventory.js';
import LineVue from '../components/Line.vue'
import SvgBackgroundVue from '../components/SvgBackground.vue';
import Category from '../services/Category';
import MultiselectVue from '../components/Multiselect.vue';
import header from '../services/Header'
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
export default {
  components: {
    'bottom-bar': BottomBarVue,
    'modal-vue': ModalVue,
    'line-vue': LineVue,
    multiselect: MultiselectVue,
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
      selectedItem: null,
      filterInventory: ''
    }
  },
  computed: {
    filteredItems() {
      return this.items.filter(item => item.name.toUpperCase().includes(this.filterInventory.toUpperCase()))
    }
  },
  async mounted() {
    header.set('Mon inventaire')
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
    async openCamera() {
      // Laurier: 3166290200647
      const { text, cancelled } = await BarcodeScanner.scan()
      if (!cancelled) {
        return items
          .getFromBarCodeInInventory(text)
          .then(item => this.openItem(item))
          .catch(() => this.createItemInDb(text))
      }
    },
    async createItemInDb(barcode) {
      const item = await items.createFromBarCode(barcode).catch(() => ({product: null}))
      const itemsId = this.allItems.map(_item => _item._id)
      this.selectedItem = item.related.filter(_item => itemsId.includes(_item._id)).pop()
      this.$refs.createItemModal.open(item).subscribe(async res => {
        if(!res || !item.product.product_name) {
          return
        }
        let itemFromDb = null
        if(this.selectedItem) {
          this.selectedItem.imageUrl = item.product.image_url
          this.selectedItem.barcode = barcode
          itemFromDb = await items.createItem(this.selectedItem)
          this.selectedItem = null
        } else {
          itemFromDb = await items.createItem({
            name : item.product.product_name,
            imageUrl: item.product.image_url,
            barcode,
            description : '',
            price : 0,
            categoriesId : [ ],
          })
        }
        await inventory.addItem(itemFromDb._id)
        itemFromDb.total = 0
        this.openItem(itemFromDb)
      })
    },
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
    createItem() {
      this.$refs.createModal.open().subscribe(async res => {
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
    padding: 0 10px;
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

h2 {
  margin-top: 0;
}
.confirm-product {
  text-align: center;
  img {
    max-width: 100px;
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