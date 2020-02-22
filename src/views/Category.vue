<template>
  <div class="root-category">
    <div class="list-container">
      <div class="form">
        <input type="text" v-model="category.name" placeholder="Nom...">
        <button @click="update">Sauvegarder</button>
      </div>
    </div>
    <bottom-bar :text="category.items ? category.items.length : 0 + ' listes au total'" @action="linkItem" />
    <modal-vue ref="linkModal">
      <div slot="header">
        Lier des produits à une catégorie
      </div>
      <div slot="body">
        <div class="items">
          <div class="item" v-for="item of allItems" :key="item._id">
            <input type="checkbox" :id="item._id" v-model="itemsSelected" :value="item._id">
            <label :for="item._id">{{item.name}}</label>
          </div>
        </div>
      </div>
    </modal-vue>
  </div>
</template>

<script>
import Categories from '../services/categories';
import BottomBarVue from '../components/BottomBar.vue';
import ModalVue from '../components/Modal.vue';
import items from '../services/items';

export default {
  components: {
      'bottom-bar': BottomBarVue,
      modalVue: ModalVue
  },
  data() {
    return {
      categoryId: null,
      category: {},
      allItems: [],
      itemsSelected: []
    }
  },
  async mounted() {
    this.categoryId = this.$route.params.categoryId 
    await this.getCategory()
    this.allItems = await items.getAll()
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    async getCategory() {
      this.category = await Categories.get(this.categoryId)
    },
    async update() {
      await Categories.createCategory(this.category)
      await this.getCategory()
    },
    async linkItem() {
      this.$refs.linkModal.open().subscribe(async res => {
        if(!res) return 
        await Categories.linkItems(this.itemsSelected)
        this.itemsSelected = []
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.root-category {
  display: flex;
  flex-direction: column;
  height: 100%;
  .list-container {
    height: 100%;
    overflow: auto;
  }
  .form {
    margin: 10px;
  }
  .items {
    height: 55vh;
    border-radius: 5px;
    border: 1px solid lightgrey;
    .item {
      display: flex;
      justify-content: center;
      align-items: center;
      input {
        width: 10px;
      }
      &>label {
        flex-grow: 1;
        font-size: 1.2em;
      }
    }
  }
}
</style>