import API from './API'
import User from './User'
import Socket from './Socket'
import { ref } from 'vue'
function Auth() {
  /**
   * @type {import('vue').Ref<import('./User').default>}
   */
  this.user = ref(null)
  /** @type {String} */
  this.token = localStorage.getItem('token')
  if(this.token) {
    Socket.connect(this.token)
    this.getUser()
  }

}
/**
 * @return {Promise<Boolean>}
 */
Auth.prototype.isLogged = async function() {
  const {data: isLogged} = await API.get('/user/')
  return isLogged
}
/**
 * @return {Promise<User>}
 */
Auth.prototype.getUser = async function() {
  const {data: user} = await API.get('/user', {
    headers: {
      token: this.token
    }
  })
  console.log(this.user)
  this.user.value = new User(user)
  return this.user.value
}
/**
 * @return {Promise<User>}
 */
Auth.prototype.save = async function() {
  await API.post('/user/me', this.user.value, {
    headers: {
      token: this.token
    }
  })
  return this.user.value
}
Auth.prototype.disconnect = async function() {
  this.user.value = null
  this.token = null
  localStorage.setItem('token', null)
}

/**
 * @param {User} user
 * @return {Promise<string|boolean>}
 */
Auth.prototype.login = async function(user) {
  const {data: token} = await API.post('/user/login', user)
  if(token) {
    this.token = token
    Socket.connect(this.token)
    this.user.value = await this.getUser()
  }
  localStorage.setItem('token', this.token)
  return token
}

/**
 * @param {User} user
 * @return {Promise<string|boolean>}
 */
Auth.prototype.register = async function(user) {
  const {data: token} = await API.post('/user/register', user)
  if(token) {
    this.token = token
    Socket.connect(this.token)
    this.user.value = await this.getUser()
  }
  localStorage.setItem('token', this.token)
  return token
}
export default new Auth()
