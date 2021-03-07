<template>
  <div class="root-items">
    <welcome image="smoothies" header="Mes produits" description="Comme s'il en pleuvait !" :mini="true"  :actions="[{icon: 'fas fa-barcode', cb: openCamera}, {icon: 'fas fa-plus', cb: createItem}]"/>
    <svg-background :bottom="items && items.length" svg="cookie">
      <br>
      <div>Hey !</div>
      <br>
      Appuies sur le <i class="fas fa-plus" aria-hidden="true"></i> pour ajouter un produit dans cette liste
    </svg-background>
    <div class="header">
      <div class="filter-items">
        <i class="fas fa-search" aria-hidden="true"></i>
        <input type="text" v-model="filterItems" placeholder="Chercher un produit">
      </div>
      <div class="checkbox-container">
        <input type="checkbox"  v-model="onlyNotCategorize">
        <label @click="onlyNotCategorize = !onlyNotCategorize">
          <span></span>
        </label>
      </div>
    </div>
    <div v-if="onlyNotCategorize" class="onlyNotCategorizeText">Seul les produits sans catégories sont affichés</div>
    <div class="items-container" @scroll="setPosition" ref="scrollElement">
      <div v-for="item of filteredItems" :key="item._id" @click="$router.push({name:'item', params: {itemId: item._id}})">
        <line-vue
          :additionalAction="true"
          :name="item.name"
          :image="item.image"
          :additionalCenter="item.price + '€' + getCategoriesForItem(item)"
          :description="item.description"
          @action="openOptions(item)"/>
      </div>
    </div>
    <modal-vue ref="createModal">
      <template #body>
        <input type="text" v-model="itemToCreate.name" placeholder="Nom...">
        <input type="text" v-model="itemToCreate.description" placeholder="Description...">
        <input type="number" v-model="itemToCreate.price" placeholder="Prix...">
      </template>
    </modal-vue>
    <modal-vue ref="confirmProduct">
      <template #body="{data}">
        <div class="confirm-product" v-if="data && data.product">
          Lier à un item existant
          <multiselect :options="items" :value="selectedItem ? [selectedItem] : []" customKey="_id" customLabel="name" :single="true" placeholder="Choisir un produit..." @input="selectedItem = $event[0]"/>
          <div v-if="!selectedItem">
            ou créer un nouvel item
            <input type="text" v-model="data.product.product_name" >
            <img loading="lazy"  :src="api.getImageURL(data.product.image_url)" alt="">
          </div>
        </div>
        <div v-else>Produit non trouvé</div>
      </template>
    </modal-vue>
    <modal-vue ref="changeCategory" :noActions="true">
      <template #header>Ajouter à une catégorie</template>
      <template #body="{data: item}" >
        <div v-if="item">
          {{item.name}}
        </div>
        <div v-if="categories" class="categories">
          <div v-for="category of categories" :key="category._id" @click="$refs.changeCategory.close(category)" class="category">
            {{category.name}}
            <i class="fas fa-chevron-right" aria-hidden="true"></i>
          </div>
        </div>
      </template>
    </modal-vue>
    <options-vue ref="options" :options="[
      {label:  'Modifier le produit', select: update},
      {label:  'Modifier la catégorie', select: updateCategory},
      {label:  'Suppression', select: deleteItem},
    ]"/>
  </div>
</template>

<script>
import ModalVue from '../components/Modal.vue';
import items from '../services/items.js';
import LineVue from '../components/Line.vue'
import OptionsVue from '../components/Options.vue';
import SvgBackgroundVue from '../components/SvgBackground.vue';
import MultiselectVue from '../components/Multiselect.vue';
import Category from '../services/Category';
import header from '../services/Header'
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import Socket from '../services/Socket';
import Welcome from '../components/dashboard/Welcome.vue';
import api from '../services/API';
export default {
  components: {
    'modal-vue': ModalVue,
    'line-vue': LineVue,
    OptionsVue,
    multiselect: MultiselectVue,
    svgBackground: SvgBackgroundVue,
    Welcome
  }, 
  data() {
    return {
      onlyNotCategorize: false,
      api,
      items: [],
      itemToCreate: {
        name: '',
        description: ''
      },
      max: 10,
      categories: {},
      selectedItem: null,
      filterItems: ''
    }
  },
  computed: {
    filteredItems() {
      return this.items.filter(item => {
        if(this.onlyNotCategorize) {
          return !item.categoriesId || !item.categoriesId.length
        }
        return item.name.toUpperCase().includes(this.filterItems.toUpperCase())
      }).slice(0,this.max)
    }
  },
  async mounted() {
    header.set('Mes produits')
    await this.refresh()
    this.$refs.scrollElement.scrollTop = this.$root.scroll.listItems
    Socket.socket.on('item:update', this.refresh)
    Socket.socket.on('item:delete', this.refresh)
    Socket.socket.on('category:update', this.refresh)
    Socket.socket.on('category:item:add', this.refresh)
    Socket.socket.on('category:item:delete', this.refresh)
    Socket.socket.on('category:delete', this.refresh)
  },
  beforeUnmount() {
    Socket.socket.off('item:update', this.refresh)
    Socket.socket.off('item:delete', this.refresh)
    Socket.socket.off('category:update', this.refresh)
    Socket.socket.off('category:item:add', this.refresh)
    Socket.socket.off('category:item:delete', this.refresh)
    Socket.socket.off('category:delete', this.refresh)
  },
  methods: {
    async refresh() {
      await this.getAllItems()
      await this.getCategories()
    },
    async getCategories() {
      const categories = await Category.getCategories() 
      categories.forEach(categ => this.categories[categ._id] = categ)
    },
    setPosition(evt) {
      this.$root.scroll.listItems = this.$refs.scrollElement.scrollTop
      if(evt.target.scrollTop + evt.target.offsetHeight > evt.target.scrollHeight - 100) {
        this.max += 10
      }
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
    updateCategory() {
      this.$refs.changeCategory.open().subscribe(category => {
        if(!category) return
        Category.linkItems(category._id, [this.selectedItem._id])
      })
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
.onlyNotCategorizeText {
  margin-left: 10px;
  font-size: 0.8em;
}
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

.categories {
  max-height: 300px;
  overflow: auto;
  .category {
    padding: 10px 0;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    &:last-of-type {
      border-bottom: none;
    }
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: auto;
  margin-top: 10px;
  width: 95%;
}
  .checkbox-container {
    display: flex;

    width: max-content;
    margin-left: 20px;
    input[type='checkbox'] + label > span {
      margin-right: 0px;
    }
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
    border-color: #9E9E9E;

    width: .4em;
    height: .8em;    
    border-color: var(--headerBgColor);
    transform: translate3d(0,-0.5em,0) rotate(45deg);
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