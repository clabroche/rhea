<template>
  <div>
    <div class="filter-container">
      <div class="filter-items">
        <i class="fas fa-search" aria-hidden="true"></i>
        <input type="text"
          :value="filterItemsInPopup" @input="filterItemsInPopup = $event.target.value"
          placeholder="Chercher un produit">
      </div>
      <div class="checkbox-container" v-if="onlyNotCategorizeActive">
        <input type="checkbox"  v-model="onlyNotCategorize">
        <label @click="onlyNotCategorize = !onlyNotCategorize">
          <span></span>
        </label>
      </div>
    </div>
    <div v-if="onlyNotCategorize" class="only-not-categorize">
      Seul les produits sans categories sont affichés
    </div>
    <div class="items">
      <div class="item" v-for="item of allItemsMinusItemInRecipe" :key="item._id">
        <div class="checkbox-container">
          <input type="checkbox"  :id="item._id" 
            :value="item._id" @input="toggleItem(item)">
          <label :for="item._id">
            <span></span>
            {{item.name}}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import sort from 'fast-sort'
import items from '../services/items'
import { ref } from '@vue/reactivity'
import { computed, onMounted, watch } from '@vue/runtime-core'
import { cloneDeep } from 'lodash-es'
export default {
  props: {
    value: {default: () => ([])},
    excludedItems: {default: () => ([])},
    onlyNotCategorizeActive: {default: false}
  },
  setup(props, comp) {
    // Filter binding
    /** @type {import('vue').Ref<{[key:string]: any}>} */
    const localValue = ref(props.value)
    watch(() => cloneDeep(props.value), () => localValue.value = props.value, { deep: true })
    watch(() => cloneDeep(localValue), () => comp.emit('update:filter', localValue.value), { deep: true })


    const filterItemsInPopup = ref('')
    const allItems = ref([])
    const itemsSelected = ref([])
    const onlyNotCategorize = ref(false)
    onMounted(async() => {
      allItems.value = await items.getAll()
    })
    return {
      filterItemsInPopup,
      allItems,
      itemsSelected,
      onlyNotCategorize,
      allItemsMinusItemInRecipe: computed(() => {
        const itemFilter = item => {
          let isNotFiltered = true
          if(item.name && filterItemsInPopup.value) {
            isNotFiltered = item.name.toUpperCase().includes(filterItemsInPopup.value.toUpperCase()) && !props.excludedItems.map(it => it._id).includes(item._id)
          }
          if(isNotFiltered && onlyNotCategorize.value) {
            return !item.categoriesId || !item.categoriesId.length
          }
          return isNotFiltered
        } 
        return sort(allItems.value.filter(itemFilter)).asc('name')
      }),
      toggleItem(item) {
        if(!localValue.value.includes(item)) {
          localValue.value.push(item)
        } else {
          localValue.value.splice(localValue.value.indexOf(item), 1)
        }
      }
    }
  },
  methods: {
    
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  display: flex;
  justify-content: space-between;
  input[type="checkbox"]~label span {
    margin: 0;
    margin-left: 20px;
  }
  .checkbox-container {
    width: auto;
  }
}

  .filter-items {
    width: 95%;
    margin: auto;
    i {
      color: lightgrey;
      position: absolute;
      padding: 12px;
    }
    input {
      outline: none;
      border-radius: 20px;
      border: 1px solid lightgrey;
      padding: 5px;
      height: 30px;
      text-indent: 25px;
    }
  }
  .items {
    height: 55vh;
    border-radius: 5px;
    border: 1px solid lightgrey;
    overflow: auto;
    .item {
      display: flex;
      justify-content: center;
      align-items: center;
      input {
        width: 10px;
      }
      &>label {
        flex-grow: 1;
        font-size: 1.2em;
      }
    }
  }
  .only-not-categorize {
    font-size: 0.8em;
  }
  .checkbox-container {
    display: flex;
    width: 100%;
  }

  input[type='checkbox']{ height: 0; width: 0; }

  input[type='checkbox'] + label{
    position: relative;
    display: flex;
    margin: .6em 0;
    align-items: center;
    color: #2c3e50;
    transition: color 250ms cubic-bezier(.4,.0,.23,1);
  }
  input[type='checkbox'] + label > ins{
    position: absolute;
    display: block;
    bottom: 0;
    left: 2em;
    height: 0;
    width: 100%;
    overflow: hidden;
    text-decoration: none;
    transition: height 300ms cubic-bezier(.4,.0,.23,1);
  }
  input[type='checkbox'] + label > span{
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-right: 1em;
    width: 1.5em;
    height: 1.5em;
    background: transparent;
    border: 2px solid #9E9E9E;
    border-radius: 2px;
    cursor: pointer;  
    transition: all 250ms cubic-bezier(.4,.0,.23,1);
  }


  input[type='checkbox']:checked + label > span{
    animation: shrink-bounce 200ms cubic-bezier(.4,.0,.23,1);
  }
  input[type='checkbox']:checked + label > span:before{
    content: "";
    position: absolute;
    top: .2em;
    left: .2em;
    border-right: 4px solid transparent;
    border-bottom: 4px solid transparent;
    transform: rotate(45deg);
    transform-origin: 0% 100%;
    border-color: #9E9E9E;

    width: .4em;
    height: .8em;    
    border-color: var(--headerBgColor);
    transform: translate3d(0,-0.5em,0) rotate(45deg);
  }

@keyframes checkbox-check{
  0%{
    width: 0;
    height: 0;
    border-color: #212121;
    transform: translate3d(0,0,0) rotate(45deg);
  }
  33%{
    width: .2em;
    height: 0;
    transform: translate3d(0,0,0) rotate(45deg);
  }
  100%{    
    width: .4em;
    height: .8em;    
    border-color: var(--headerBgColor);
    transform: translate3d(0,-0.5em,0) rotate(45deg);
  }
}

@keyframes shrink-bounce{
  0%{
    transform: scale(1);
  }
  33%{    
    transform: scale(.85);
  }
  100%{
    transform: scale(1);    
  }
}
</style>