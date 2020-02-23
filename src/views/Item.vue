<template>
  <div class="root-item">
     <svg-background :bottom="true" svg="cookie">
    </svg-background>
    <div class="form">
      <input type="text" v-model="item.name" placeholder="Nom...">
      <input type="text" v-model="item.description" placeholder="Description...">
      <input type="number" v-model="item.price" placeholder="Prix...">
      <button @click="update">Sauvegarder</button>
    </div>
  </div>
</template>

<script>
import Items from '../services/items';
import SvgBackgroundVue from '../components/SvgBackground.vue';
export default {
  data() {
    return {
      itemId: null,
      item: {}
    }
  },
  components: {
    svgBackground: SvgBackgroundVue
  },
  async mounted() {
    this.itemId = this.$route.params.itemId 
    await this.getItem()
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    async getItem() {
      this.item = await Items.get(this.itemId)
    },
    async update() {
      await Items.createItem(this.item)
      await this.getItem()
    },
  }
}
</script>

<style lang="scss" scoped>
.root-item {
  display: flex;
  flex-direction: column;
  height: 100%;
  .form {
    margin: 10px;
  }
  
}
</style>