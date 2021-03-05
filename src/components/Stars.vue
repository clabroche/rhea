<template>
  <div class="stars">
    <div class="star" v-for="i of 5" :key="'star-' + i">
      <i :class="score < i ? 'far' : 'fas'" class="fa-star" @click="$emit('update:score', i)"></i>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    score: {default: 0}
  }
}
</script>

<style lang="scss" scoped>
.stars {
  display: flex;
}
</style>