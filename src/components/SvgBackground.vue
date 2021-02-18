<template>
  <div id="svg-no-lists" v-if="!bottom">
    <img :src="imgPath" alt="" >
    <slot/>
  </div>
</template>

<script>
export default {
  props: {
    bottom: {default: true},
    svg: {default: 'list'}
  },
  data() {
    return {
      svgs: {
        list: require('@/assets/list.svg'),
        cookie: require('@/assets/cookie.svg'),
        category: require('@/assets/category.svg'),
        recipe: require('@/assets/recipe.svg'),
        inventory: require('@/assets/inventory.svg'),
      }
    }
  },
  computed: {
    imgPath() {
      return this.svgs[this.svg]
    }
  }
}
</script>

<style lang="scss">
  #svg {
    z-index: -1;
    position: fixed;
    bottom: 50px;
    right: 0;
    width: 75vw;  
    img {
      width: 100%;
    }
  }
  #svg-no-lists {
    z-index: -1;
    position: fixed;
    top: 0;
    right: 0;
    width: 100vw;  
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: #466c80;
    img {
      width: 50%;
    }
  }
</style>