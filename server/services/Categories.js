const {mongo} = require('../helpers/mongoConnect')
const ObjectID = require('mongodb').ObjectID
function Category(category) {
  if(!category.ownerId) throw new Error('category should be own from a user')
  /** @type {ObjectID | string} */
  this._id = mongo.getID(category._id)
  /** @type {string} */
  this.name = category.name || ''
  /** @type {Items} */
  this.items = category.items || null
}
Category.all = async function(userId) {
  const categorys = await mongo.collection('categories')
    .find({ownerId: mongo.getID(userId)})
    .sort({name: 1})
    .toArray()
  return categorys.map(category => new Category(category))
}
module.exports = Category