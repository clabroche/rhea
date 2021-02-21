import { reactive } from "vue"

export default reactive({
  title: 'Rhea',
  subtitle: '',
  set(title, subtitle) {
    this.title = title || ''
    this.subtitle = subtitle || ''
  }
})