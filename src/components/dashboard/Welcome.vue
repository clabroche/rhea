<template>
  <div class="welcome-root">
    <div class="left">
      <div class="title" :style="{fontSize: headerFontSize }">
        {{header}}
      </div>
      <div class="description" v-if="description.trim()">
        {{description}}
        <slot></slot>
      </div>
    </div>
    <div class="right" v-if="actions?.length">
      <div class="action" @click="action.cb()" v-for="(action, i) of actions" :key="'action-' + i">
        <i :class="'fas fa-'+ action.icon" aria-hidden="true"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    image: {},
    header: {default: 'Bonjour !'},
    headerFontSize: {default: null}, 
    description: {default: 'Un petit achat ?'},
    mini: {default: false},
    actions: {default: () => []},
  }
}
</script>

<style lang="scss" scoped>
.welcome-root {
  height: 50px;
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  padding-bottom: 0;
  align-items: center;
  background-size: cover;
  color: white;
  position: relative;
  margin-bottom: 1px;
  flex-shrink: 0;
  .title {
    font-size: 1.8em;
    font-weight: bold;
    margin-bottom: 5px;
    color: var(--headerBgColor);
  }
  .description {
    font-size: 1em;
    font-size: 0.9em;
    color: var(--headerBgColor);
  }
}
.right {
  display: flex;
  .action{
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--headerBgColor);
    margin: 0 10px;
    font-size: 1.5em;
  }
}
</style>