const {mongo} = require('../helpers/mongoConnect')
/**
 * @param {User} user 
 */
function User(user) {
  this._id = mongo.getID(user._id)
  this.email = user.email || ''
  this.token = user.token || ''
}
User.getUser = async function(userId) {
  const user = await mongo
    .collection('users')
    .findOne(userId)
  return new User(user)
}
module.exports = User