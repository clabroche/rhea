import API from './API'
import Auth from './Auth'
export default {
  books: [],
  async getItems() {
    const {data: items} = await API.get('/inventory/items/', {
      headers: {
        token: Auth.token
      }
    })
    return items
  },
}