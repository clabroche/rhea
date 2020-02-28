<template>
  <div class="line-root">
    <div class="line-container">
      <div class="progress" :style="{width: getPercent() + '%', backgroundColor: 'hsl('+getPercent()+', 70%, 50%)'}"></div>
      <div class="checkbox-container" v-if="checkbox">
        <input type="checkbox" ref="check" :checked="percent === 100">
        <label @click.stop="checkboxClick">
          <span></span>
        </label>
      </div>
      <div class="line-content">
        <div class="name">
          {{name}}
        </div>
        <div class="description">
          {{description}}
        </div>
      </div>
    </div>
    <div class="bottom-line">
      <div class="additional-left" v-if="additionalLeft !== null">
        {{additionalLeft}}
      </div>
      <div class="additional-center" v-if="additionalCenter !== null">
        {{additionalCenter}}
      </div>
      <div class="additional-right" v-if="additionalAction" @click.stop="$emit('action')">
        <i class="fas" :class="'fa-'+ additionalActionIcon"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    name: {default: ''},
    percent: {default: 0},
    description: {default: ''},
    checkbox: {default: false},
    additionalAction: {default: false},
    additionalLeft: {default: null},
    additionalCenter: {default: null},
    additionalActionIcon: {default: 'sliders-h'}
  },
  data() {
    return {
    }
  },
  methods: {
    getColor() {
      if(this.percent < 25) { return '#F00'}
      if(this.percent < 50) { return '#0F0'}
      if(this.percent < 75) { return '#00F'}
      if(this.percent <= 100) { return '#0FF'}
    },
    checkboxClick() {
      this.$emit('checkboxClick', this.$refs.check.checked)
    },
    getPercent() {
      let percent = this.percent
      if(percent < 0) percent = 0
      if(percent > 100) percent = 100
      return percent 
    }
  }
}
</script>

<style lang="scss" scoped>
  .line-root {
    width: 100%;
    border: 1px solid lightgrey;
    box-sizing: border-box;
    margin-bottom: 10px;
    margin-top: 10px;
    box-shadow: 0px 0px 4px 1px lightgrey;
    .line-container {
      background-color: #fff;
      padding: 10px;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
      .progress {
        position: absolute;
        left: 0;
        top: 0px;
        height: 4px;
        background-color: red;
        transition: 300ms;
      }
      display: flex;
      align-items: center;
      height: 50px;
      .line-content {
        display: flex;
        flex-direction: column; 
        justify-content: center;
        .name {
          color: var(--headerBgColor);
          font-size: 1.1em;
          white-space: nowrap;
        }
        .description {
          font-size: 0.8em;
          color: #6c6c6c
        }
      }
    }
    .bottom-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 30px;;
      width: 100%;
      background-color: #efefef;
      .additional-center {
        padding: 0 10px;
        color: #85888a;
        font-size: 0.9em;
      }
      .additional-right, .additional-left {
        height: 100%;
        width: 50px;
        background-color: var(--headerBgColor);
        color: var(--headerTextColor);
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

.checkbox-container {
  display: flex;
}
input[type='checkbox']{ height: 0; width: 0; }

input[type='checkbox'] + label{
  position: relative;
  display: flex;
  margin: .6em 0;
  align-items: center;
  color: #9e9e9e;
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
input[type='checkbox'] + label > ins > i{
  position: absolute;
  bottom: 0;
  font-style: normal;
  color: #4FC3F7;
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

input[type='checkbox'] + label:hover, input[type='checkbox']:focus + label{
  color: #fff;
}
input[type='checkbox'] + label:hover > span, input[type='checkbox']:focus + label > span{
  background: rgba(255,255,255,.1);
}
input[type='checkbox']:checked + label > ins{ height: 100%; }

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
  animation: checkbox-check 125ms 250ms cubic-bezier(.4,.0,.23,1) forwards;
  border-color: #9E9E9E
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
    border-color: #444;
    transform: translate3d(0,-0.5em,0) rotate(45deg);
  }
}
</style>