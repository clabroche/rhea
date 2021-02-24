<template>
  <div class="tabs">
    <div class="buttons">
      <button @click="currentTab = tab" v-for="tab of tabs" :key="tab.label" :class="{active: tab?.id === currentTab?.id}">
        {{tab.label}}
        <label v-if="showLabels">{{tab?.data?.value?.length || tab?.data?.length || 0}}</label>
      </button>
    </div>
    <div class="content">
      <slot :data="currentTab?.data?.value || currentTab?.data" :tab="currentTab" v-if="currentTab"/>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
export default {
  props: {
    tabs: {default: () => []},
    showLabels: {default: true}
  },
  setup(props) {
    const currentTab = ref()
    onMounted(() => {
      if(props.tabs) currentTab.value = props.tabs[0]
    })
    return {
      currentTab
    }
  }
}
</script>

<style lang="scss" scoped>
.tabs {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  overflow: auto;
  flex-grow: 1;
}
.buttons {
  display: flex;
  align-items: flex-end;
  margin: auto;
  margin-bottom: 10px;
  border-bottom: 2px solid var(--headerBgColor);
  height: 45px;
  flex-shrink: 0;
  width: 90%;
  button {
    background-color: white;
    color: black;
    border-radius: 5px 5px 0 0;
    transition: 300ms;
    border: 1px solid var(--headerBgColor);
    border-bottom: 0;
    box-shadow: 0 0 7px -1px darkgrey;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 5px;
    &.active {
      border-radius: 5px 5px 0 0;
      height: auto;
      background-color: var(--headerBgColor);
      color: white;
      font-size: 0.9em;
      margin-bottom: -1px;
    }
    label {
      background-color: #fff;
      margin-left: 10px;
      color: var(--headerBgColor);
      display: flex;
      justify-content: center;
      align-items: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      padding-top: 2px;
      box-sizing: border-box;
    }
  }
}
.content {
  position: relative;
  overflow: auto;
  flex-grow: 1;
}
</style>