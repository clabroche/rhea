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
Category.all = async function (userId) {
  const categories = await mongo.collection('categories')
    .find({ ownerId: mongo.getID(userId) })
    .sort({ name: 1 })
    .toArray()
  return categories.map(category => new Category(category))
}

Category.create = async function (ownerId, category) {
  if(category._id) return this.update(ownerId, category)
  await mongo.collection('categories')
    .insertOne({
      name: category.name,
      ownerId: mongo.getID(ownerId)
    })
}
Category.update = async function (ownerId, category) {
  await mongo.collection('categories')
    .updateOne({
      _id: mongo.getID(category._id),
    }, {
      $set: {
        name: category.name,
        ownerId: mongo.getID(ownerId)
      }
    }, { upsert: true }
    )
}
Category.delete = async function (ownerId, categoryId) {
  await mongo.collection('categories')
    .remove({ ownerId: mongo.getID(ownerId), _id: mongo.getID(categoryId) })
}

Category.get = async function (ownerId, categoryId) {
  return  mongo.collection('categories')
    .findOne({ ownerId: mongo.getID(ownerId), _id: mongo.getID(categoryId) })
}

module.exports = Category