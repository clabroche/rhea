import { createApp } from 'vue';
import App from './App.vue'
import router from './router'
import lineClamp from 'vue-line-clamp'
createApp(App)
  .use(lineClamp, {
    // plugin options
  })
  .use(router)
  .mount('#app')
