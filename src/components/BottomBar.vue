<template>
  <div class="root-bottom-bar">
    <div class="left">
      {{text}}
    </div>
    <div class="actions">
      <div class="action" @click="action.cb()" v-for="(action, i) of actions" :key="'action-' + i">
        <i :class="'fas fa-'+ action.icon" aria-hidden="true"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    text: {default: ''},
    actions: {default: () => ({})}
  }
}
</script>


<style lang="scss" scoped>
.root-bottom-bar {
  width: 100%;
  height: 40px; 
  border-top: 2px solid var(--headerBgColorAccentGradient);
  display: flex;
  justify-content: space-between;
  .left {
    padding: 10px;
    display: flex;
    align-items: center;
  }

  .actions {
    display: flex;
    .action {
      width: 45px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 20px;
      background-color: var(--headerBgColor);
      color: var(--headerTextColor);
      border-right: 1px solid var(--headerBgColorAccent);
      @include backgroundGradient;

    }
  }
}
</style>