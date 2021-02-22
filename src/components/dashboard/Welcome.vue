<template>
  <div class="welcome-root" :class="{[image]: image, mini}">
    <div class="title">
      {{header}}
    </div>
    <div class="description">
      {{description}}
    </div>
    <div class="actions" v-if="actions?.length">
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
    description: {default: 'Un petit achat ?'},
    mini: {default: false},
    actions: {default: () => []},
  }
}
</script>

<style lang="scss" scoped>
.welcome-root {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 175px;
  background-size: cover;
  color: white;
  position: relative;
  margin-bottom: 1px;
  flex-shrink: 0;
  @include backgroundGradientImage(0.6, '../../assets/login.jpg');
  &.bullet::before  {
    background-image: url('../../assets/bullet.jpg');
    background-position: bottom;
  }
  &.mini {
    height: 100px;
    .title {
      font-size: 2em;
    }
    .description {
      font-size: 1em;
      margin-top: 20px;
    }
  }
  .title {
    font-size: 3em;
  }
  .description {
    font-size: 1em;
    margin-top: 20px;
  }
}
.actions {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin: 0 10px;
  .action{
    flex-shrink: 0;
    padding: 10px;
    background-color: rgba(0,0,0,0.2);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>