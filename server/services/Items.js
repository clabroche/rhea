const {mongo} = require('../helpers/mongoConnect')
const ObjectID = require('mongodb').ObjectID
const Users = require('./Users')
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
Item.getItems = async function(userId) {
  const items = await mongo.collection('items')
    .find({ownerId: mongo.getID(userId)})
    .sort({name: 1})
    .toArray()
  return items.map(item => new Item(item))
}
Item.updateOrCreate = async function(itemToCreate, userId) {
  itemToCreate.ownerId = mongo.getID(userId)
  itemToCreate = new Item(itemToCreate)
  delete itemToCreate.owner
  if(itemToCreate._id) 
    await mongo
      .collection('items')
      .updateOne({_id: mongo.getID(itemToCreate._id)}, {$set: itemToCreate})  
  else await mongo
      .collection('items')
      .insertOne(itemToCreate)
  return itemToCreate
}
Item.getItem = async function(id) {
  const item = await mongo
    .collection('items')
    .findOne({_id: mongo.getID(id)})
  return item ? new Item(item) : null
}
Item.delete = async function(id) {
  const item = await mongo
    .collection('items')
    .deleteOne({_id: mongo.getID(id)})
  return item
}
module.exports = Item