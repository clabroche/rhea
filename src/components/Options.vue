<template>
  <transition name="appear">
    <div class="options-root" v-if="show" @click.stop="close()">
      <div class="options-container" @click.stop="">
        <div class="header">
          {{header}}
        </div>
        <div class="options">
          <div class="option" v-for="option of options" :key="option.label" @click="option.select(option.value); close()">
            {{option.label}}
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import CustomObservable from '../services/CustomObservable'
export default {
  props: {
    options: {default: []}
  },
  data() {
    return {
      observable: new CustomObservable(),
      header: '',
      show: false
    }
  },
  methods: {
    open(label) {
      this.header = label
      this.show =true 
      return this.observable
    },
    close() {
      this.show = false
      this.header = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.options-root {
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.8);
  position: fixed;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  .header {
    padding: 10px;
    background-color: var(--headerBgColor);
    color: var(--headerTextColor);
  }
  .options-container {
    background-color: #fff;
    width: 100%;
    .option {
      padding: 10px;
      transition: 300ms;
      cursor: pointer;
      &:hover {
        background-color: rgba(0,0,0,0.1);
      }
    }
  }
}
.appear-enter-active, .appear-leave-active {
  transition: opacity .3s;
}
.appear-enter, .appear-leave-to {
  opacity: 0;
}
</style>