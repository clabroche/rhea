<template>
  <div class="root-bottom-bar">
    <div class="left">
      {{text}}
    </div>
    <div class="action" @click="$emit('action')">
      <i class="fas fa-plus"></i>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    text: {default: ''}
  }
}
</script>


<style lang="scss" scoped>
.root-bottom-bar {
  width: 100%;
  height: 50px; 
  border-top: 2px solid var(--headerBgColorAccent);
  display: flex;
  justify-content: space-between;
  .left {
    padding: 10px;
    display: flex;
    align-items: center;
  }
  .action {
    width: 45px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    background-color: var(--headerBgColor);
    color: var(--headerTextColor)
  }
}
</style>