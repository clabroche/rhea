<template>
  <div class="root" @click.stop :style="{width}">
    <div ref="input" class="input" @click.stop="open()">
      <div v-if="!value.length && !isOpen" class="placeholder">{{placeholder}}</div>
      <div v-if="!value.length && isOpen" class="placeholder">Choisir une entrée ci-dessous...</div>
      <div v-for="itemValue in value" :key="getKey(itemValue)" class="item-container">
        <div class="label">
          {{getLabel(itemValue)}}
        </div><!--
  --><div class="delete" @click.stop="deleteTag(itemValue)" ><i class="fas fa-trash" aria-hidden="true"></i></div>
      </div>
      <div class="random" v-if="random" @click.stop="selectRandom"><i class="fas fa-sync-alt" aria-hidden="true"></i></div>
    </div>
    <transition name="fade">
      <div class="container" v-if="isOpen" >
        <input type="text" ref="filter" placeholder="Rechercher..." @input="filter()">
        <div class="categories" v-if="categories">
          <div
            @click="changeCategory(option)"
            class="category"
            :class="{
              active: option.name === currentCateg.name && option.name !== undefined
            }"
            v-for="option of optionsComputed"
            :key="option.name">
              {{option.name}}
            </div>
        </div>
        <div class="options-container" >
          <div
            v-for="option in filteredOptions"
            :key="getKey(option)"
            class="item"
            :id="'multiselect-item-'  + (getLabel(option))"
            @click="select(option)">
            <span>{{getLabel(option)}}</span>
            <span v-if="option.additionnal">{{option.additionnal}}</span>
          </div>
        </div>
        <div class="count" v-if="filteredOptions && filteredOptions.length">{{filteredOptions.length}} entrée</div>
      </div>
    </transition>
  </div>
</template>

<script>
import {some} from 'lodash-es'
// import Spinner from '@/components/Spinner'
export default {
  name: 'multiselect',
  props: {
    options: { default: () => [] },
    value: { default: () => [] },
    customLabel: { default: null },
    customKey: { default: null },
    width: { default: 'auto' },
    single: { default: false },
    categories: {default: false},
    placeholder: {default: 'Cliquez pour choisir...'},
    autofocus: {default: false},
    random: {default: false}
  },
  components: {
    // spinner: Spinner
  },
  data() {
    return {
      isOpen: false,
      filteredOptions: [],
      currentCateg: null,
      count: 0,
      opening: false
    }
  },
  mounted() {
    this.filteredOptions = this.options
    if (this.categories) {
      this.currentCateg = this.options[0]
    }
    this.filter()
  },
  computed: {
    optionsComputed() {
      return this.options.filter(option => option.values && option.values.length)
    }
  },
  methods: {
    selectRandom() {
      const random = this.options[Math.floor(Math.random() * this.options.length)]
      this.select(random)
    },
    getKey(option) {
      if (this.currentCateg && this.currentCateg.customKey) {
        return option[this.currentCateg.customKey]
      }
      return this.customKey ? option[this.customKey] : option
    },
    getLabel(option) {
      if (this.currentCateg && this.currentCateg.customLabel) {
        return option[this.currentCateg.customLabel]
      }
      return this.customLabel ? option[this.customLabel] : option
    },
    filter() {
      const value = this.$refs.filter ? this.$refs.filter.value.toUpperCase() : ''
      let options = this.options
      if (this.categories && this.currentCateg) {
        options = this.options.filter(opt => opt.name === this.currentCateg.name).pop().values
      }
      this.filteredOptions = options.filter(option => {
        if (some(this.value, option) || this.value.includes(option)) return false
        return this.getLabel(option)
          ? this.getLabel(option).toUpperCase().includes(value)
          : this.getLabel(option)
      })
    },
    changeCategory(category) {
      this.currentCateg = category
      this.$forceUpdate()
      this.filter()
    },
    async open() {
      this.opening = true
      await wait(10) // wait to trigger spinner animation
      await this.$nextTick()
      this.isOpen = true
      this.filter()
      await this.$nextTick()
      await this.$nextTick()
      if(this.autofocus) {
        this.$refs.filter.focus()
      }
      const cb = () => {
        this.isOpen = false
        document.removeEventListener('click', cb)
      }
      document.addEventListener('click', cb)
      this.opening = false
    },
    select(value) {
      const index = this.filteredOptions.indexOf(value)
      this.filteredOptions.splice(index, 1)
      if (this.single) {
        // eslint-disable-next-line vue/no-mutating-props
        this.value.length = 0
        this.isOpen = false
      }
      // eslint-disable-next-line vue/no-mutating-props
      this.value.push(value)
      this.filter()
      this.$emit('input', this.value)
    },
    deleteTag(value) {
      const index = this.value.indexOf(value)
      // eslint-disable-next-line vue/no-mutating-props
      this.value.splice(index, 1)
      this.filteredOptions.push(value)
      this.filter()
      this.$emit('input', this.value)
    }
  }
}
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
</script>

<style scoped lang="scss" >
.input{
  background-color: #fff;
  width: auto;
  cursor: pointer;
  min-height: 30px;
  border: 1px solid lightgrey;
  padding-right: 5px;
  padding-left: 5px;
  padding-top: 5px;
  padding-bottom: 5px;
  position: relative;
  .spinner {
    position: absolute;
    top: -10px;
    right: -10px;
    height: 100%;
  }
  .placeholder {
    color: #a1a1a1;
    padding-top: 4px;
  }
  .random {
    position: absolute;
    top: 10px;
    right: 10px;
  }
  .item-container {
    border: 1px solid lightgrey;
    display: inline-block;
    border-radius: 4px;
    overflow: hidden;
    background-color : #26928e;
    max-width: 100%;
    padding: 5px;
    box-sizing: border-box;
    position: relative;
    opacity: 1;
    transition: 200ms;
    transition-property: opacity,transform;
    &>div{
      color: white;
      // height 1.2em
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      opacity: 1;
    }
    .delete {
      transition: 200ms;
      transition-property: opacity;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      opacity: 0;
    }
    &:hover {
      transform: scale(1.05);
      .delete {
        background-color: rgba(0,0,0, 0.3);
        opacity: 1;
      }
      &>div {
        opacity: 0;
      }
    }

  }
}

.container {
  width: 100%;
  position: absolute;
  z-index: 1;
  max-height: 300px;
  opacity: 1;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid lightgrey;
  border-top: none;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
  input {
    width: auto;
    margin: 10px;
    margin-bottom: 10px;
  }
  .categories {
    display: flex;
    align-items: flex-end;
    padding-left: 10px;
    border-bottom: 1px solid #c8c8c8;
    flex-shrink: 0;
    &>div {
      padding-left: 10px;
      padding-right: 10px;
      padding-top: 2px;
      padding-bottom: 2px;
      bottom: -1px;
      position: relative;
      font-size: 0.9em;
      cursor: pointer;
      color: #777;
      &:hover {
        color: black;
      }
      &.active {
        border-top: 1px solid #c8c8c8;
        border-left: 1px solid #c8c8c8;
        border-right: 1px solid #c8c8c8;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        background-color: white;
        color: black;
      }
    }
  }
  .item {
    cursor: pointer;
    padding: 7px;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 0.9em;
    display: flex;
    justify-content: space-between;
    &:hover, &.selected {
      background-color: rgba(0,0,0,0.1);
    }
  }
  .options-container {
    overflow:-y auto;
    overflow-x: hidden;
    background-color: #fff;
  }
}
.count {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  border-top: 1px solid #c8c8c8;
  color: #717171;
  padding-right: 5px;
  font-size: 0.7em;
}
.root{
  position: relative;
}

.fade-enter-active, .fade-leave-active {
  transition: max-height .2s,opacity .2s;
}
.fade-enter, .fade-leave-to {
  max-height: 0;
  opacity: 0
}
</style>
