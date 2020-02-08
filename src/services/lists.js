import API from './API'

import Auth from './Auth'
export default {
  books: [],
  async getLists() {
    const {data: lists} = await API.get('/lists', {
      headers: {
        token: Auth.token
      }
    })
    return lists
  },  
  async createList(listToCreate) {
    const {data: list} = await API.post('/lists', listToCreate, {
      headers: {
        token: Auth.token
      },
    })
    return list
  },
  async getList(listId) {
    if(!listId) throw new Error('Provide listId param')
    const {data: list} = await API.get('/lists/' + listId, {
      headers: {
        token: Auth.token
      },
    })
    return list
  },
  async deleteItem(listId, itemId) {
    if (!listId) throw new Error('Provide listId param')
    if (!itemId) throw new Error('Provide itemId param')
    const { data: list } = await API.delete('/lists/' + listId + '/items/' + itemId, {
      headers: {
        token: Auth.token
      },
    })
    return list
  },
  async deleteList(listId) {
    if (!listId) throw new Error('Provide listId param')
    const { data: list } = await API.delete('/lists/' + listId, {
      headers: { token: Auth.token },
    })
    return list
  },
  async addItem(listId, item) {
    const {data: list} = await API.post(`/lists/${listId}/addItem`, item, {
      headers: {
        token: Auth.token
      },
    })
    return list
  },
  async update(listToUpdate) {
    const {data: list} = await API.put(`/lists/${listToUpdate._id}`, listToUpdate, {
      headers: {
        token: Auth.token
      },
    })
    return list
  },
  async incrementItem(listId, itemId, amount) {
    await API.put(`/lists/${listId}/items/${itemId}/increment/${amount}`, null, {
      headers: { token: Auth.token },
    })
  },
  async updateQuantity(listId, itemId, quantity) {
    await API.put(`/lists/${listId}/items/${itemId}/quantity/${quantity}`, null, {
      headers: { token: Auth.token },
    })
  }
}