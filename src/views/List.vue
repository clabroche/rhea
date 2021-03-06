<template>
  <div class="list-root" v-if="list">
    <welcome image="bullet" :header="list?.name || ' '" description=" " :mini="true"  :actions="[{icon: 'fas fa-plus', cb: createItem}]"/>
    <svg-background :bottom="categories && categories.length" svg="list">
      <br>
      <div>On y est presque !</div>
      <br>
      Appuies sur le <i class="fas fa-plus" aria-hidden="true"></i> pour ajouter un produit dans cette liste
    </svg-background>
    <tabs :tabs="[{id: 'all', label: 'Tout', data: filteredMissingItems}, {id: 'missing', label: 'Non achetés', data: sortedCategories}]" :showLabels="false">
      <template #default="{ tab}">
        <div class="list-container">
          <div class="filter-items">
            <i class="fas fa-search" aria-hidden="true"></i>
            <input type="text" :value="filterItems" @input="filterItems = $event.target.value" placeholder="Chercher un produit">
          </div>
          <div class="tabs-content">
          <transition name="fade-tab">
            <div v-if="tab.id === 'missing'">

              <transition-group name="fade">
                <div  v-for="item of filteredMissingItems" :key="item._id" @click="incrementItem(item)" class="fade">
                  <line-vue
                    :checkbox="true"
                    :additionalAction="true"
                    :name="item.name"
                    :image="item.image"
                    :description="item.description"
                    :additionalLeft="item.total - item.selected"
                    :additionalCenter="(+item.price || 0).toFixed(2).replace('.', ',') + '€'"
                    :percent="item.selected * 100 / item.total"
                    @action="openOptions(item)"
                    @checkboxClick="checkBoxClick(item, $event)"/>
                </div>
              </transition-group>
              <svg-background :bottom="filteredMissingItems?.length || (!categories?.length)" svg="check">
                <br>
                <div>Bravo !</div>
                <br>
                Fais chauffer la carte bleue maintenant !
              </svg-background>
            </div>
            <div v-else>
              <transition-group name="fade" >
                  <div v-for="category of sortedCategories" :key="category.label" class="fade">
                    <div class="label" @click="category.collapse = !category.collapse">
                      <span>{{category.label}}</span>
                      <i class="fas" aria-hidden="true" :class="category.collapse ? 'fa-chevron-down' : 'fa-chevron-up'"></i>
                    </div>
                    <div v-if="!category.collapse">
                      <transition-group name="fade">
                      <div  v-for="item of filteredItems(category.items)" :key="item._id" @click="incrementItem(item)">
                        <line-vue
                          :checkbox="true"
                          :additionalAction="true"
                          :name="item.name"
                          :description="item.description"
                          :additionalLeft="item.total - item.selected"
                          :image="item.image"
                          :additionalCenter="(+item.price || 0).toFixed(2).replace('.', ',') + '€'"
                          :percent="item.selected * 100 / item.total"
                          @action="openOptions(item)"
                          @checkboxClick="checkBoxClick(item, $event)"/>
                      </div>
                  </transition-group>
                </div>
              </div>
              </transition-group>
            </div>
          </transition>
          </div>
          </div>
      </template>
    </tabs>
    <bottom-bar v-if="list._id" :text="list.items.length + ' produits pour un montant de ' + getTotalPrice + '€'"/>
    <modal-vue ref="createModal" height="auto">
      <template #body class="createModal">
        <multiselect :options="allItems" customKey="_id" customLabel="name" :single="true" placeholder="Choisir un produit..." @input="selectItem"/>
        <div v-if="!itemToCreate._id">
          <label>ou créé en un</label>
          <input type="text" v-model="itemToCreate.name" placeholder="Nom...">
          <input type="text" v-model="itemToCreate.description" placeholder="Description...">
          <input type="number" v-model="itemToCreate.price" placeholder="Price...">
        </div>
        <label>Choisir une quantitée</label>
        <input type="number" v-model="itemToCreate.total" placeholder="Total...">
      </template>
    </modal-vue>
    <modal-vue ref="quantityModal" >
      <template #body>
        Quantité:
        <input type="number" v-model="selectedItem.total" placeholder="Total...">
      </template>
    </modal-vue>
    <options-vue ref="options" :options="[
      {label:  'Modification de la quantité', select: updateQuantity},
      {label:  'Modification du produit', select: updateItem},
      {label:  'Suppression', select: deleteItem},
    ]"/>
  </div>
</template>

<script>
import lists from '../services/lists'
import Items from '../services/items'
import BottomBarVue from '../components/BottomBar.vue';
import LineVue from '../components/Line.vue';
import ModalVue from '../components/Modal.vue';
import lodash from 'lodash'
import OptionsVue from '../components/Options.vue';
import MultiselectVue from '../components/Multiselect.vue'
import Category from '../services/Category';
import SvgBackgroundVue from '../components/SvgBackground.vue';
import sort from 'fast-sort'
import header from '../services/Header'
import Socket from '../services/Socket';
import notification from '../services/notification';
import Welcome from '../components/dashboard/Welcome.vue';
import Tabs from '../components/Tabs.vue';

export default {
  components: {
    multiselect: MultiselectVue,
    bottomBar: BottomBarVue,
    lineVue: LineVue,
    modalVue: ModalVue,
    optionsVue: OptionsVue,
    svgBackground: SvgBackgroundVue,
    Welcome,
    Tabs
  },
  data() {
    return {
      list: [],
      categories: [],
      itemToCreate: {total: 1, name: '', description: '', price: 0},
      selectedItem: {},
      allItems: [],
      allCategoriesById: {},
      filterItems: '',
      missingcollapse: true
    }
  },
  computed: {
    sortedCategories() {
      if(!this.missingcollapse) return true
      return sort(this.categories.filter(cat => this.filteredItems(cat.items).length)).asc('label')
    },
    filteredMissingItems() {
      const categories = sort(this.categories.filter(cat => this.filteredItems(cat.items).length)).asc('label')
      const items = []
      categories.forEach(cat => items.push(...cat.items.filter(item => +item.total !== +item.selected)))
      return items
    },
    getTotalPrice() {
      return this.list.items.reduce((price, item) => {
        return (+item.price || 0) * +item.total + price
      }, 0).toFixed(2).replace('.', ',')
    }
  },
  async created() {
    (await Category.getCategories()).map(cat => this.allCategoriesById[cat._id] = cat)
    await this.getList()
    Socket.socket.on('list:item:add', this.getList)
    Socket.socket.on('list:item:delete', this.getList)
    Socket.socket.on('list:item:increment', this.getList)
    Socket.socket.on('list:item:quantity', this.getList)
    Socket.socket.on('item:barcode', this.getList)
    Socket.socket.on('item:update', this.getList)
    Socket.socket.on('item:delete', this.getList)
  },
  beforeUnmount() {
    Socket.socket.off('list:item:add', this.getList)
    Socket.socket.off('list:item:delete', this.getList)
    Socket.socket.off('list:item:increment', this.getList)
    Socket.socket.off('list:item:quantity', this.getList)
    Socket.socket.off('list:item:barcode', this.getList)
    Socket.socket.off('list:item:update', this.getList)
    Socket.socket.off('list:item:delete', this.getList)
  },
  methods: {
    filteredItems(items) {
      return items.filter(item => item.name.toUpperCase().includes(this.filterItems.toUpperCase()))
    },
    async getList() {
      const list = await lists.getList(this.$route.params.listId)
      header.set('Ma liste') 
      header.subtitle = list.name
      const str = JSON.stringify(list)
      if(this.backList=== str) return
      this.backList = str
      const categories = lodash.groupBy(list.items, item => item.categoriesId?item.categoriesId[0] : undefined)
      this.categories = Object.keys(categories).map(key => {
        const categ = this.allCategoriesById[key]
        const label = categ ? categ.name : 'Autres'
        return {_id: key, label ,items: categories[key], collapse: false}
      })
      this.list = list
    },
    selectItem(items) {
      this.itemToCreate._id = items[0] ? items[0]._id : null
      return this.getList()
    },
    updateQuantity() {
      this.$refs.quantityModal.open(this.selectedItem).subscribe(async res => {
        if(!res) return 
        await lists.updateQuantity(this.list._id, this.selectedItem._id,  this.selectedItem.total)
        this.selectedItem = {}
        notification.next('success', `Quantitée modifiée.`)
        return this.getList()
      })
    },
    updateItem() {
      this.$router.push({name: 'item', params: {itemId: this.selectedItem._id}})
      this.selectedItem = {}
      return this.getList()
    },
    async deleteItem() {
      await lists.deleteItem(this.list._id, this.selectedItem._id) 
      notification.next('success', `Produit supprimé.`)
      this.selectedItem = {}
      return this.getList()
    },
    async openOptions(item) {
      this.$refs.options.open(item.name)
      this.selectedItem = item
      this.allItems = await Items.getAll()
    },
    async createItem() {
      this.allItems = await Items.getAll()
      this.$refs.createModal.open().subscribe(async res => {
        if(!res) return
        if(!this.itemToCreate._id && this.itemToCreate.name) { // Manual item -> create it
          const item = await Items.createItem(this.itemToCreate)
          this.itemToCreate._id = item._id
        }
        if(this.itemToCreate._id) { // Is valid item
          this.itemToCreate.selected = 0
          await lists.addItem(this.list._id, this.itemToCreate)
          notification.next('success', `Produit ajouté à la liste.`)
          this.itemToCreate = {total:1, name: '', description: '', price: 0}
          this.allItems = await Items.getAll()
          return this.getList()
        }
      })
    },
    async incrementItem(item) {
      await lists.incrementItem(this.list._id, item._id, +item.selected+1)
      return this.getList()
    },
    async checkBoxClick(item, checked) {
      await lists.incrementItem(this.list._id, item._id, !checked ? item.total : 0)
      return this.getList()
    }
  },
}
</script>

<style lang="scss" scoped>
.list-root {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: auto;
  height: 100%;
  .list-container {
    height:100%;
    padding: 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    .tabs-content {
      flex-grow: 1;
      overflow: auto;
      position: relative;
      padding: 5px;
    }
    .label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 1.5em;
      color: var(--headerBgColor)
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
.createModal {
  label  {
    color: lightgrey;
    display: inline-block;
    margin: auto;
    width: 100%;
    text-align: center;
  }
}
.fade-tab-enter-active,
.fade-tab-leave-active {
  transition: opacity 0.3s ease;
  position: absolute !important;
  width: calc(100% - 10px);
}
.fade-tab-enter-from,
.fade-tab-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  // opacity: 0;
  overflow: hidden;
  max-height: 0;
  margin: 0;
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  max-height: 100vh;
  overflow: hidden;
}
</style>