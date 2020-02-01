import API from "./API"
import Auth from "./Auth"

/**
 * 
 * @param {User} user 
 */
// @ts-ignore
// eslint-disable-next-line no-unused-vars
function User(user = {}) {
  this._id = user._id || null
  this.email = user.email || ""
  this.username = user.username || ""
  this.shared = user.shared || []
}

User.prototype.save = async function() {
  const {data: user} = await API.post('/user', this, {
    headers: {token: Auth.token}
  })
  this._id = user._id
}
User.prototype.shareTo = async function(userId) {
  await API.post('/user/share/'+userId, this, {
    headers: {token: Auth.token}
  })
}
User.prototype.getSharedLibrary = async function(userId) {
  const {data:shared} = await API.get('/user/share/'+userId, {
    headers: {token: Auth.token}
  })
  return shared
}
User.prototype.shareDelete = async function(userId) {
  await API.delete('/user/share/'+userId, {
    headers: {token: Auth.token}
  })
}
User.get = async function(_id) {
  const {data: user} = await API.get('/user/' + _id)
  return new User(user)
}

User.allUsers = async function() {
  const {data: users} = await API.get('/user/all', {
    headers: {token: Auth.token}
  })
  return users.map(u => new User(u))
}

User.all = async function() {
  const {data: stories} = await API.get('/user/')
  return stories.map(s => new User(s))
}

export default User
