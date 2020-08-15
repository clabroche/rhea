import API from './API'
import Auth from './Auth'

export default {
  async getItem(itemToGet) {
    const {data: item} = await API.get('/items/' + itemToGet._id, {
      headers: {
        token: Auth.token
      }
    })
    return item
  },  
  async createItem(itemToCreate) {
    const {data: item} = await API.post('/items', itemToCreate, {
      headers: {
        token: Auth.token
      },
    })
    return item
  },
  async getAll() {
    const { data: items } = await API.get('/items', {
      headers: {
        token: Auth.token
      },
    })
    return items
  },
  async get(itemId) {
    const {data: item} = await API.get('/items/' + itemId, {
      headers: {
        token: Auth.token
      },
    })
    return item
  },
  async remove(itemId) {
    const {data: items} = await API.delete('/items/' + itemId, {
      headers: {
        token: Auth.token
      },
    })
    return items
  },
  async getFromBarCode(code) {
    const {data:res} = await API.post('/items/barcode/' + code, null, {
      headers: {
        token: Auth.token
      },
    })
    return { product: res.product, related: res.related}
  },
}