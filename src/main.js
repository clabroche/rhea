import Vue from 'vue'
import App from './App.vue'
import router from './router'
import lineClamp from 'vue-line-clamp'
import VModal from 'vue-js-modal'
Vue.use(VModal)
Vue.use(lineClamp, {
  // plugin options
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
