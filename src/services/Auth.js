import API from './API'
import User from './User'
function Auth() {
  /**
   * @type {User}
   */
  this.user = null
  /** @type {String} */
  this.token = localStorage.getItem('token')
  if(this.token) {
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
  this.user = new User(user)
  return this.user
}
/**
 * @return {Promise<User>}
 */
Auth.prototype.save = async function() {
  await API.post('/user/me', this.user, {
    headers: {
      token: this.token
    }
  })
  return this.user
}
Auth.prototype.disconnect = async function() {
  this.user = null
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
    this.user = await this.getUser()
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
    this.user = await this.getUser()
  }
  localStorage.setItem('token', this.token)
  return token
}
export default new Auth()
