import API from './API'
import Auth from './Auth'
export default {
  books: [],
  async get() {
    const { data: items } = await API.get('/inventory/', {
      headers: {
        token: Auth.token
      }
    })
    return items
  },
  async getItems() {
    const { data: items } = await API.get('/inventory/items', {
      headers: {
        token: Auth.token
      }
    })
    return items
  },
  async addItem(itemId) {
    const { data: items } = await API.post('/inventory/items/', {
      _id: itemId, total: 1
    }, {
      headers: {
        token: Auth.token
      }
    })
    return items
  },
  async updateTotal(itemId, total) {
    const { data: items } = await API.put('/inventory/items/'+itemId+'/total' , {total}, {
      headers: {
        token: Auth.token
      }
    })
    return items
  },
  async removeItem(itemId) {
    const { data: items } = await API.delete('/inventory/items/' + itemId, {
      headers: {
        token: Auth.token
      }
    })
    return items
  },
}