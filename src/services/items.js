import axios from 'axios'
import Auth from './Auth'
export default {
  books: [],
  axios: axios.create({
    baseURL: process.env.VUE_APP_SERVER_URL + ':' + process.env.VUE_APP_SERVER_PORT,
    headers: {
      user: 'toto'
    }
  }),
  async getItem(itemToGet) {
    const {data: item} = await this.axios.get('/items/' + itemToGet._id, {
      headers: {
        token: Auth.token
      }
    })
    return item
  },  
  async createItem(itemToCreate) {
    const {data: item} = await this.axios.post('/items', itemToCreate, {
      headers: {
        token: Auth.token
      },
    })
    return item
  },
  async getAll() {
    const {data: items} = await this.axios.get('/items', {
      headers: {
        token: Auth.token
      },
    })
    return items
  },
  async get(itemId) {
    const {data: item} = await this.axios.get('/items/' + itemId, {
      headers: {
        token: Auth.token
      },
    })
    return item
  },
  async remove(itemId) {
    const {data: items} = await this.axios.delete('/items/' + itemId, {
      headers: {
        token: Auth.token
      },
    })
    return items
  },
}