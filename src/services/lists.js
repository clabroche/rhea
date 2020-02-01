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
  async getLists() {
    const {data: lists} = await this.axios.get('/lists', {
      headers: {
        token: Auth.token
      }
    })
    return lists
  },  
  async createList(listToCreate) {
    const {data: list} = await this.axios.post('/lists', listToCreate, {
      headers: {
        token: Auth.token
      },
    })
    return list
  },
  async getList(listId) {
    if(!listId) throw new Error('Provide listId param')
    const {data: list} = await this.axios.get('/lists/' + listId, {
      headers: {
        token: Auth.token
      },
    })
    return list
  },
  async deleteItem(listId, itemId) {
    if(!listId) throw new Error('Provide listId param')
    if(!itemId) throw new Error('Provide itemId param')
    const {data: list} = await this.axios.delete('/lists/' + listId+'/items/'+itemId, {
      headers: {
        token: Auth.token
      },
    })
    return list
  },
  async addItem(listId, item) {
    const {data: list} = await this.axios.post(`/lists/${listId}/addItem`, item, {
      headers: {
        token: Auth.token
      },
    })
    return list
  },
  async update(listToUpdate) {
    const {data: list} = await this.axios.put(`/lists/${listToUpdate._id}`, listToUpdate, {
      headers: {
        token: Auth.token
      },
    })
    return list
  },
}