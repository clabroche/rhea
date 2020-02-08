<template>
  <div class="list-root">
    <div class="list-container">
      <div v-for="category of categories" :key="category.label">
        <div class="label" @click="category.collapse = !category.collapse">
          <span>{{category.label !== 'undefined' ? category.label : 'Autres'}}</span>
          <i class="fas" :class="category.collapse ? 'fa-chevron-down' : 'fa-chevron-up'"></i>
        </div>
        <div v-if="!category.collapse">
          <div  v-for="item of category.items" :key="item._id" @click="incrementItem(item)">
            <line-vue
              :checkbox="true"
              :additionalAction="true"
              :name="item.name"
              :description="item.description"
              :additionalLeft="item.total - item.selected"
              :additionalCenter="(+item.price || 0).toFixed(2).replace('.', ',') + '€'"
              :percent="item.selected * 100 / item.total"
              @action="openOptions(item)"
              @checkboxClick="checkBoxClick(item, $event)"/>
          </div>
        </div>
      </div>
      </div>
    <bottom-bar v-if="list._id" @action="createItem" :text="list.items.length + ' produits pour un montant de ' + getTotalPrice + '€'"/>
    <modal-vue ref="createModal" height="auto">
      <div slot="body" class="createModal">
        <multiselect :options="allItems" customKey="_id" customLabel="name" :single="true" placeholder="Choisir un produit..." @input="selectItem"/>
        <div v-if="!itemToCreate._id">
          <label>ou créé en un</label>
          <input type="text" v-model="itemToCreate.name" placeholder="Nom...">
          <input type="text" v-model="itemToCreate.description" placeholder="Description...">
          <input type="number" v-model="itemToCreate.price" placeholder="Price...">
        </div>
        <label>Choisir une quantitée</label>
        <input type="number" v-model="itemToCreate.total" placeholder="Total...">
      </div>
    </modal-vue>
    <modal-vue ref="quantityModal" >
      <div slot="body">
        Quantité:
        <input type="number" v-model="selectedItem.total" placeholder="Total...">
      </div>
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
export default {
  components: {
    multiselect: MultiselectVue,
    bottomBar: BottomBarVue,
    lineVue: LineVue,
    modalVue: ModalVue,
    optionsVue: OptionsVue
  },
  data() {
    return {
      list: [],
      categories: [],
      itemToCreate: {total: 1, name: '', description: '', price: 0},
      selectedItem: {},
      allItems: []
    }
  },
  computed: {
    getTotalPrice() {
      return this.list.items.reduce((price, item) => {
        return (+item.price || 0) * +item.total + price
      }, 0).toFixed(2).replace('.', ',')
    }
  },
  async mounted() {
    await this.getList()
    this.interval = setInterval(async () => {
      this.getList()
    }, 500);
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    async getList() {
      const list = await lists.getList(this.$route.params.listId)
      const str = JSON.stringify(list)
      if(this.backList=== str) return
      this.backList = str
      const categories = lodash.groupBy(list.items, 'category')
      this.categories = Object.keys(categories).map(key => ({label: key, items: categories[key], collapse: false}))      
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
          this.itemToCreate = {total:1}
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
  height: 100%;
  .list-container {
    height:100%;
    padding: 10px;
    overflow: auto;
    .label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 1.5em;
      color: var(--headerBgColor)
    }
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
</style>