const {mongo} = require('../helpers/mongoConnect')
const ObjectID = require('mongodb').ObjectID
const Users = require('./Users')
const Categories = require('./Categories')
const PromiseB = require('bluebird')
function Item(item) {
  if(!item.ownerId) throw new Error('item should be own from a user')
  /** @type {ObjectID | string} */
  this._id = mongo.getID(item._id)
  /** @type {string} */
  this.name = item.name || ''
  /** @type {string} */
  this.description = item.description || ''
  /** @type {number} */
  this.price = item.price || 0
  /** @type {number} */
  this.barcode = Number.isNaN(+item.barcode) ? 0 : +item.barcode
  /** @type {ObjectID[] | string[]} */
  this.categoriesId = item.categoriesId || []
  /** @type {ObjectID | string} */
  this.ownerId = mongo.getID(item.ownerId) || ''
  /** @type {User} */
  this.owner = item.owner || null
}
Item.prototype.getUser = async function() {
  this.owner = await Users.getUser(this.ownerId)
}
Item.getItems = async function (userId) {
  const items = await mongo.collection('items')
    .find({ ownerId: mongo.getID(userId) })
    .sort({ name: 1 })
    .toArray()
  return items.map(item => new Item(item))
}
Item.prototype.fetchByName = async function () {
  if(!this._id) {
    const item = await mongo.collection('items')
      .findOne({ name: this.name })
    if(item) this._id = item._id
  }
  return this
}
Item.search = async function (userId, search) {
  const items = await mongo.collection('items')
    .find({ ownerId: mongo.getID(userId), name: new RegExp(`${search}`, 'gi') })
    .sort({ name: 1 })
    .toArray()
  return items.map(item => new Item(item))
}
Item.getByBarcode = async function (userId, barcode) {
  const item = await mongo.collection('items')
    .findOne({ ownerId: mongo.getID(userId), barcode: +barcode})
  return item ? new Item(item) : null
}
Item.updateOrCreate = async function(itemToCreate, userId) {
  itemToCreate.ownerId = mongo.getID(userId)
  const item = new Item(itemToCreate)
  await item.fetchByName()
  console.log(item)
  delete item.owner
  if(item._id) 
    await mongo
      .collection('items')
      .updateOne({_id: mongo.getID(item._id)}, {$set: item})  
  else await mongo
      .collection('items')
      .insertOne(item)
  return item
}
Item.getItem = async function(id) {
  const item = await mongo
    .collection('items')
    .findOne({_id: mongo.getID(id)})
  return item ? new Item(item) : null
}
Item.delete = async function(id) {
  const item = await mongo.collection('items').findOne({_id: mongo.getID(id)})
  if(item.categoriesId) {
    await PromiseB.map(item.categoriesId, categoryId => {
      return Categories.removeLinkItems(item.ownerId, categoryId, item._id)
    })
  }
  await mongo
    .collection('items')
    .deleteOne({_id: mongo.getID(id)})
  return item
}
module.exports = Item