import Vue from 'vue'
import App from './App.vue'
import router from './router'
import lineClamp from 'vue-line-clamp'
import VModal from 'vue-js-modal'
Vue.use(VModal)
Vue.use(lineClamp, {
  // plugin options
})
Vue.filter('capitalize', (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
