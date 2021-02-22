<template>
  <div class="root-lists">
    <welcome :mini="true"/>
    <div class="lists-container">
      <product-section 
        headerIcon="fas  fa-fire"
        headerText="Mes produits les plus achetés"
        noItemsText="Commencez par ajouter des produits dans vos listes pour voir des produits ici !"
        :list="popular"/>
      <product-section 
        headerIcon="fas  fa-clock"
        headerText="Mes produits créés récemment"
        noItemsText="Commencez par ajouter des produits dans vos listes pour voir des produits ici !"
        :list="history"/>
    </div>
  </div>
</template>

<script>
import Welcome from '../components/dashboard/Welcome.vue'
import ProductSection from '../components/ProductSection.vue'
import header from '../services/Header'
import items from '../services/items'
export default {
  components: {
    ProductSection,
    Welcome
  }, 
  data() {
    return {
      popular: [],
      history: [],
    }
  },
  async mounted() {
    header.set('Accueil')
    this.refresh()
  },
  methods: {
    async refresh() {
      this.popular = await items.getPopular()
      this.history = await items.getHistory()
    }
  }
}
</script>

<style lang="scss" scoped>
.root-lists {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  .lists-container {
    margin-top: 20px;
    height:100%;
    padding: 10px;
    overflow: auto;
  }
}
</style>